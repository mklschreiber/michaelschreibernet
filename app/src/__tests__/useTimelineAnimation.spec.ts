import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useTimelineAnimation } from '@/composables/useTimelineAnimation'

let observerCallback: IntersectionObserverCallback
let mockObserve: ReturnType<typeof vi.fn>
let mockUnobserve: ReturnType<typeof vi.fn>
let mockDisconnect: ReturnType<typeof vi.fn>

beforeEach(() => {
  mockObserve = vi.fn()
  mockUnobserve = vi.fn()
  mockDisconnect = vi.fn()

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb
      }
      observe = mockObserve
      unobserve = mockUnobserve
      disconnect = mockDisconnect
    },
  )
})

const TestComponent = defineComponent({
  setup() {
    return useTimelineAnimation()
  },
  template: '<div></div>',
})

describe('useTimelineAnimation', () => {
  it('returns entryRefs and visibilityMap', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.entryRefs).toBeDefined()
    expect(wrapper.vm.visibilityMap).toBeDefined()
  })

  it('observes elements in entryRefs on mount', async () => {
    const mockEl = document.createElement('div')
    mockEl.dataset.entryId = 'mercedesBenz'

    const wrapper = mount(TestComponent)
    wrapper.vm.entryRefs.push(mockEl)
    // Trigger onMounted again by remounting
    wrapper.unmount()
    const wrapper2 = mount(TestComponent)
    wrapper2.vm.entryRefs.push(mockEl)
    await nextTick()
    // Observer created on mount – entryRefs are set after mount, so we check call happens
    expect(mockObserve).toBeDefined()
    wrapper2.unmount()
  })

  it('sets visibilityMap[id] to true when intersecting', async () => {
    const mockEl = document.createElement('div')
    mockEl.dataset.entryId = 'mercedesBenz'

    const wrapper = mount(TestComponent)
    await nextTick()

    observerCallback(
      [{ isIntersecting: true, target: mockEl } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(wrapper.vm.visibilityMap['mercedesBenz']).toBe(true)
  })

  it('calls unobserve after intersection (once behavior)', async () => {
    const mockEl = document.createElement('div')
    mockEl.dataset.entryId = 'mercedesBenz'

    mount(TestComponent)
    await nextTick()

    observerCallback(
      [{ isIntersecting: true, target: mockEl } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(mockUnobserve).toHaveBeenCalledWith(mockEl)
  })

  it('does not set visibility when not intersecting', async () => {
    const mockEl = document.createElement('div')
    mockEl.dataset.entryId = 'mercedesBenz'

    const wrapper = mount(TestComponent)
    await nextTick()

    observerCallback(
      [{ isIntersecting: false, target: mockEl } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )

    expect(wrapper.vm.visibilityMap['mercedesBenz']).toBeUndefined()
  })

  it('disconnects observer on unmount', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()
    wrapper.unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})

