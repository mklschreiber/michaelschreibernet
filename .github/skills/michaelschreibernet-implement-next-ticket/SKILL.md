---
name: michaelschreibernet-implement-next-ticket
description: Claim the first derived-ready Trello ticket and run the Architect, Developer, Tester workflow. Use this when the user asks to implement the next ticket or explicitly identifies a Trello ticket.
---

Trello is authoritative. Never use `app/.ai-docs/tickets/`, a local backlog, or
local ticket artifacts as requirements, dependency state, or progress state.

## Contract and preflight

`TRELLO_BOARD_ID`, `TRELLO_API_KEY`, and `TRELLO_TOKEN` are required
environment variables. `curl`, `jq`, and Bash are required tools. The key and
token are secrets: do not print the environment, enable shell tracing, use
verbose curl output, write them to a file, or put them in prompts or comments.

`MSNET_TICKET_ID` is optional. When set, it must be the exact `MSNET-XXXX`
prefix of the explicitly requested card. When unset, select the first ready
Backlog card by Trello `pos`. An `In Progress` card is resumed only when its
exact ID is explicitly provided.

First run the preflight, board validation, card retrieval, title validation,
and `readiness_reason` procedure in
[`michaelschreibernet-open-tickets`](../michaelschreibernet-open-tickets/SKILL.md).
Do not continue unless it completed successfully. This ensures there is
exactly one active list named `Backlog`, `In Progress`, `Blocked`, and `Done`,
and that ticket IDs are unique. It also gives this skill `tickets_json` and
the validated Board list data without using a local fallback.

Select one card:

```bash
if [ -n "${MSNET_TICKET_ID:-}" ]; then
  selected_card="$(ticket_by_id "$MSNET_TICKET_ID")" ||
    { printf 'Requested ticket %s is absent or ambiguous on TRELLO_BOARD_ID.\n' "$MSNET_TICKET_ID" >&2; exit 1; }
  selected_list="$(jq -r '.listName' <<<"$selected_card")"
  case "$selected_list" in
    Backlog) selected_mode=claim ;;
    "In Progress") selected_mode=resume ;;
    *) printf 'Requested ticket %s is in %s; only Backlog cards can be claimed and only explicitly identified In Progress cards can resume.\n' "$MSNET_TICKET_ID" "$selected_list" >&2; exit 1 ;;
  esac
  [ "$(readiness_reason "$selected_card")" = "ready" ] ||
    { printf 'Requested ticket %s is not ready: %s\n' "$MSNET_TICKET_ID" "$(readiness_reason "$selected_card")" >&2; exit 1; }
else
  selected_mode=claim
  selected_card="$(jq -c 'sort_by(.pos)[] | select(.listName == "Backlog")' <<<"$tickets_json" |
    while IFS= read -r candidate; do
      [ "$(readiness_reason "$candidate")" = "ready" ] && { printf '%s\n' "$candidate"; break; }
    done)"
  [ -n "$selected_card" ] ||
    { printf 'No ready tickets on the configured Trello board.\n' >&2; exit 0; }
fi
```

## Revalidate and claim

Immediately before claiming or resuming, re-fetch the selected card and every
dependency. The request functions below do not retry writes. They report HTTP
401/403 as credentials or access failures and do not print response bodies or
secrets.

```bash
trello_write() {
  local method=$1 path=$2 response status body
  shift 2
  TRELLO_WRITE_TRANSPORT_FAILURE=0
  response="$(curl --silent --show-error --connect-timeout 10 --max-time 30 \
    --request "$method" --get \
    --data-urlencode "key=$TRELLO_API_KEY" \
    --data-urlencode "token=$TRELLO_TOKEN" \
    "$@" "https://api.trello.com${path}" --write-out $'\n%{http_code}')" ||
    { TRELLO_WRITE_TRANSPORT_FAILURE=1; printf 'Trello write timed out or had a transport failure.\n' >&2; return 1; }
  status=${response##*$'\n'}
  body=${response%$'\n'*}
  case "$status" in
    2??) printf '%s' "$body" ;;
    401|403) printf 'Trello write failed: credentials are missing, invalid, or lack board access (HTTP %s).\n' "$status" >&2; return 1 ;;
    *) printf 'Trello write failed for %s (HTTP %s).\n' "$path" "$status" >&2; return 1 ;;
  esac
}

selected_id="$(jq -r '.id' <<<"$selected_card")"
selected_name="$(jq -r '.name' <<<"$selected_card")"
selected_card="$(trello_get "/1/cards/$selected_id" \
  --data-urlencode 'fields=id,idBoard,idList,name,desc,pos,url,idMembers')" || exit 1
[ "$(jq -r '.idBoard' <<<"$selected_card")" = "$TRELLO_BOARD_ID" ] ||
  { printf 'Requested card is not on TRELLO_BOARD_ID.\n' >&2; exit 1; }
[ "$(jq -r '.name' <<<"$selected_card")" = "$selected_name" ] ||
  { printf 'Selected card title changed during claim; resolve it on Trello.\n' >&2; exit 1; }

# Rebuild the card collection from the fresh board read before calling
# readiness_reason so dependencies are checked again immediately before the move.
lists_json="$(trello_get "/1/boards/$TRELLO_BOARD_ID/lists" \
  --data-urlencode 'filter=open' --data-urlencode 'fields=id,name,pos' \
  --data-urlencode 'cards=open' \
  --data-urlencode 'card_fields=id,idList,name,desc,pos,url')" || exit 1
tickets_json="$(jq -ce '[ .[] | select(.name == "Backlog" or .name == "In Progress" or .name == "Blocked" or .name == "Done") | . as $list | .cards[]? | . + {listName: $list.name} ]' <<<"$lists_json")" || exit 1
fresh_invalid_titles="$(jq -r '.[] | select(.name | test("^MSNET-[0-9]{4}: ") | not) | .name' <<<"$tickets_json")"
[ -z "$fresh_invalid_titles" ] ||
  { printf 'Ticket title data changed during claim; resolve malformed title(s) on Trello.\n' >&2; exit 1; }
fresh_duplicate_ids="$(jq -r '[.[] | .name | capture("^(?<id>MSNET-[0-9]{4}): ").id] | group_by(.)[] | select(length > 1) | .[0]' <<<"$tickets_json")"
[ -z "$fresh_duplicate_ids" ] ||
  { printf 'Ticket IDs changed during claim and are now duplicated: %s\n' "$fresh_duplicate_ids" >&2; exit 1; }
selected_card="$(ticket_by_id "$(jq -r '.name | capture("^(?<id>MSNET-[0-9]{4}): ").id' <<<"$selected_card")")" || exit 1
[ "$(readiness_reason "$selected_card")" = "ready" ] ||
  { printf 'Ticket is no longer ready: %s\n' "$(readiness_reason "$selected_card")" >&2; exit 1; }

in_progress_list_id="$(jq -r '.[] | select(.name == "In Progress") | .id' <<<"$lists_json")"
if [ "$selected_mode" = claim ]; then
  [ "$(jq -r '.listName' <<<"$selected_card")" = "Backlog" ] ||
    { printf 'Ticket changed lists during claim. Request human resolution.\n' >&2; exit 1; }
  claim_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  claim_comment="[msnet-workflow] phase=claim actor=coordinator at=$claim_at outcome=success

Claimed from Backlog after Trello readiness revalidation."

  if ! trello_write PUT "/1/cards/$(jq -r '.id' <<<"$selected_card")" \
    --data-urlencode "idList=$in_progress_list_id" >/dev/null; then
    [ "$TRELLO_WRITE_TRANSPORT_FAILURE" -eq 1 ] ||
      { printf 'Claim move failed and was not retried.\n' >&2; exit 1; }
    current_card="$(trello_get "/1/cards/$selected_id" --data-urlencode 'fields=id,idBoard,idList,name,desc,url,idMembers')" || exit 1
    [ "$(jq -r '.idList' <<<"$current_card")" = "$in_progress_list_id" ] ||
      { printf 'Claim move was not confirmed. Reconcile the card action history manually; it was not retried.\n' >&2; exit 1; }
  fi
else
  [ "$(jq -r '.listName' <<<"$selected_card")" = "In Progress" ] ||
    { printf 'Ticket is no longer In Progress. Request human resolution.\n' >&2; exit 1; }
fi

current_card="$(trello_get "/1/cards/$selected_id" --data-urlencode 'fields=id,idBoard,idList,name,desc,url,idMembers')" || exit 1
[ "$(jq -r '.idBoard' <<<"$current_card")" = "$TRELLO_BOARD_ID" ] &&
  [ "$(jq -r '.idList' <<<"$current_card")" = "$in_progress_list_id" ] ||
  { printf 'Claim was not confirmed in In Progress. Request human resolution.\n' >&2; exit 1; }
claim_actions="$(trello_get "/1/cards/$selected_id/actions" \
  --data-urlencode 'filter=commentCard' \
  --data-urlencode 'fields=data,date' \
  --data-urlencode 'limit=50')" || exit 1
[ "$(jq '.idMembers | length' <<<"$current_card")" -eq 0 ] ||
  { printf 'The card has a recorded owner. Request human resolution.\n' >&2; exit 1; }
[ "$selected_mode" = resume ] ||
  ! jq -e 'any(.[]; .data.text | startswith("[msnet-workflow] phase=claim "))' <<<"$claim_actions" >/dev/null ||
  { printf 'The claimed card has an earlier workflow claim. Request human resolution.\n' >&2; exit 1; }

post_comment_once() {
  local card_id=$1 comment=$2 actions
  if trello_write POST "/1/cards/$card_id/actions/comments" \
    --data-urlencode "text=$comment" >/dev/null; then
    return 0
  fi
  [ "$TRELLO_WRITE_TRANSPORT_FAILURE" -eq 1 ] ||
    { printf 'Workflow comment failed and was not retried.\n' >&2; return 1; }
  actions="$(trello_get "/1/cards/$card_id/actions" \
    --data-urlencode 'filter=commentCard' \
    --data-urlencode 'fields=data,date' \
    --data-urlencode 'limit=50')" || return 1
  jq -e --arg comment "$comment" 'any(.[]; .data.text == $comment)' <<<"$actions" >/dev/null &&
    return 0
  printf 'Workflow comment may not have been written. Reconcile Trello action history manually; it was not retried.\n' >&2
  return 1
}

[ "$selected_mode" = resume ] || post_comment_once "$selected_id" "$claim_comment" || exit 1
```

Re-fetch the card after a claim, or before resuming. If it is not in `In
Progress`, is no longer on `TRELLO_BOARD_ID`, or its current member/most recent
workflow claim records another owner, stop and request human resolution. Do not
duplicate work. A new claim posts `claim_comment` with a non-retrying
`POST /1/cards/{cardId}/actions/comments?text=...`. If that POST times out,
first fetch recent `commentCard` actions and search `data.text` for the exact
`claim_comment`; do not post it again unless its absence is manually
reconciled.

## Run the three-role workflow

Pass every agent the card URL and freshly fetched description. Never replace
the description with a local copy.

1. Invoke **architect** with the Trello card URL and description. It creates
   the durable concept in `docs/architecture/`, links the card, and posts its
   `phase=architecture` comment.
2. Invoke **developer** with the same card URL and description plus the
   architecture concept path. It implements the approved concept, runs its
   required validation, and posts its `phase=implementation` comment.
3. Invoke **tester** with the same card URL and description, architecture
   concept, and implementation. It creates any durable test concept only in
   `docs/architecture/`, implements and runs tests, and posts its
   `phase=testing` comment.

For every phase, use the comment format in `docs/agent-handbook.md` and call
`post_comment_once` with the card ID and exact comment text; it provides the
required no-duplicate timeout reconciliation. On an agent or test failure
after the claim, leave the card `In Progress` and post a concise
`outcome=failed` comment with the next action. Move it to `Blocked` and post
`phase=blocked` only when a human or external prerequisite genuinely prevents
further work.

After all three phases succeed, post one
`phase=ready-for-review actor=coordinator outcome=success` comment containing
the architecture/test concept links, changed files, and validation results.
Do not move the card to `Done`, archive it, commit, or push. Explicit human
completion or review is the only normal transition to `Done`.
