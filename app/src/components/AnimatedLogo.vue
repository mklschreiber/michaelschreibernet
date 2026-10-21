<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <svg
    class="animated-logo"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill-rule="evenodd"
    clip-rule="evenodd"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-miterlimit="1.5"
    role="img"
    :aria-label="t('landing.logoAlt')"
  >
    <defs>
      <mask
        id="animated-logo-holes"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="512"
        height="512"
      >
        <rect width="512" height="512" fill="white" />
        <circle
          class="animated-logo__hole animated-logo__hole--d1"
          cx="109.298"
          cy="326.917"
          r="10.144"
          fill="black"
          style="--logo-delay: 1.20s; --logo-duration: 2.35s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d2"
          cx="82.766"
          cy="120.126"
          r="10.144"
          fill="black"
          style="--logo-delay: 1.55s; --logo-duration: 1.75s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d3"
          cx="237.275"
          cy="327.697"
          r="10.144"
          fill="black"
          style="--logo-delay: 0s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d4"
          cx="238.835"
          cy="264.489"
          r="10.144"
          fill="black"
          style="--logo-delay: 1.55s; --logo-duration: 0.40s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d5"
          cx="363.620"
          cy="193.563"
          r="10.144"
          fill="black"
          style="--logo-delay: 0.35s; --logo-duration: 1.65s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d6"
          cx="436.260"
          cy="155.895"
          r="10.144"
          fill="black"
          style="--logo-delay: 1.30s; --logo-duration: 1.65s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--d7"
          cx="409.730"
          cy="119.346"
          r="10.144"
          fill="black"
          style="--logo-delay: 2.10s; --logo-duration: 0.95s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--p4"
          cx="363.620"
          cy="193.563"
          r="10.144"
          fill="black"
          style="--logo-delay: 0.10s; --logo-duration: 1.90s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--p7"
          cx="274.730"
          cy="290.242"
          r="10.144"
          fill="black"
          style="--logo-delay: 0.10s; --logo-duration: 0.25s"
        />
        <circle
          class="animated-logo__hole animated-logo__hole--p8"
          cx="275.511"
          cy="111.542"
          r="10.144"
          fill="black"
          style="--logo-delay: 0.35s; --logo-duration: 1.20s"
        />
      </mask>
    </defs>
    <g class="animated-logo__traces" mask="url(#animated-logo-holes)">
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M793.161,888.192L663.676,1017.676L555,909"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 1.55s; --logo-duration: 1.75s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M791.529,950.641L661.085,1079.085L580,998L580,1152"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 1.20s; --logo-duration: 2.35s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M794,1118L937,1118L995,1067L918,1004"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 0.35s; --logo-duration: 1.65s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M759,1166L954,1166L997,1125L996,1068"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 0.10s; --logo-duration: 1.38s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M961,1097L843,997L899,947L985,946"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 1.30s; --logo-duration: 1.65s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M841,995L842,942L887,899L951.719,899"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 2.10s; --logo-duration: 0.95s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-452.645528)">
        <path
          class="animated-logo__trace"
          d="M755.281,988.719L791.999,952.001"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 0.10s; --logo-duration: 0.25s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-344.861261,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M795,1116L795,889"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 0.35s; --logo-duration: 1.20s"
        />
      </g>
      <g transform="matrix(0.780343,0,0,0.780343,-343.300575,-582.182452)">
        <path
          class="animated-logo__trace"
          d="M746,996L746,1072"
          pathLength="1"
          fill="none"
          stroke="currentColor"
          stroke-width="10.68"
          style="--logo-delay: 1.55s; --logo-duration: 0.40s"
        />
      </g>
    </g>
    <circle
      class="animated-logo__dot animated-logo__dot--d1"
      cx="109.298"
      cy="326.917"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 1.20s; --logo-duration: 2.35s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d2"
      cx="82.766"
      cy="120.126"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 1.55s; --logo-duration: 1.75s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d3"
      cx="237.275"
      cy="327.697"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 0s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d4"
      cx="238.835"
      cy="264.489"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 1.55s; --logo-duration: 0.40s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d5"
      cx="363.620"
      cy="193.563"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 0.35s; --logo-duration: 1.65s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d6"
      cx="436.260"
      cy="155.895"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 1.30s; --logo-duration: 1.65s"
    />
    <circle
      class="animated-logo__dot animated-logo__dot--d7"
      cx="409.730"
      cy="119.346"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 2.10s; --logo-duration: 0.95s"
    />
    <circle
      class="animated-logo__head animated-logo__head--p4"
      cx="363.620"
      cy="193.563"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 0.10s; --logo-duration: 1.90s"
    />
    <circle
      class="animated-logo__head animated-logo__head--p7"
      cx="274.730"
      cy="290.242"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 0.10s; --logo-duration: 0.25s"
    />
    <circle
      class="animated-logo__head animated-logo__head--p8"
      cx="275.511"
      cy="111.542"
      r="10.144"
      fill="none"
      stroke="currentColor"
      stroke-width="8.336"
      style="--logo-delay: 0.35s; --logo-duration: 1.20s"
    />
    <g
      class="animated-logo__wordmark"
      transform="matrix(0.9508,0,0,0.9508,17.25,46.7)"
      fill="currentColor"
    >
      <g transform="matrix(0.780343,0,0,0.780343,-376.074978,-592.32691)">
        <path
          class="animated-logo__glyph"
          data-char="m"
          data-weight="light"
          style="--logo-delay: 5.00s"
          d="M568.99 1231.31 569.29 1236.01Q570.66 1233.53 572.95 1232.15Q575.24 1230.78 578.38 1230.78Q581.66 1230.78 583.86 1232.35Q586.05 1233.92 587.01 1237.15Q588.3 1234.16 590.7 1232.47Q593.09 1230.78 596.47 1230.78Q601.05 1230.78 603.55 1233.82Q606.05 1236.86 606.05 1243.23V1259.92H602.88V1243.18Q602.88 1237.89 601 1235.71Q599.12 1233.53 595.81 1233.53Q592.19 1233.53 590.21 1235.74Q588.22 1237.95 587.69 1241.44Q587.69 1241.73 587.71 1242.02Q587.72 1242.31 587.72 1242.76V1259.92H584.52V1243.18Q584.52 1238 582.63 1235.76Q580.74 1233.53 577.43 1233.53Q574.1 1233.53 572.13 1235.21Q570.16 1236.89 569.36 1239.74V1259.92H566.19V1231.31Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="i"
          data-weight="light"
          style="--logo-delay: 5.17s"
          d="M617.85 1259.92H614.7V1231.31H617.85ZM617.85 1223.11H614.7V1218.66H617.85Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="c"
          data-weight="light"
          style="--logo-delay: 5.38s"
          d="M637.07 1257.81Q640.12 1257.81 642.46 1256.01Q644.8 1254.21 644.8 1251.01H647.63L647.68 1251.17Q647.79 1255.14 644.56 1257.81Q641.33 1260.48 637.07 1260.48Q631.36 1260.48 628.17 1256.46Q624.99 1252.44 624.99 1246.17V1245.06Q624.99 1238.82 628.16 1234.8Q631.33 1230.78 637.05 1230.78Q641.65 1230.78 644.72 1233.55Q647.79 1236.33 647.68 1240.85L647.63 1241.01H644.8Q644.8 1237.57 642.55 1235.53Q640.3 1233.48 637.05 1233.48Q632.55 1233.48 630.36 1236.78Q628.16 1240.09 628.16 1245.06V1246.17Q628.16 1251.22 630.36 1254.52Q632.55 1257.81 637.07 1257.81Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="h"
          data-weight="light"
          style="--logo-delay: 5.57s"
          d="M657.65 1236.17Q659.11 1233.61 661.47 1232.19Q663.84 1230.78 667.01 1230.78Q671.54 1230.78 673.96 1233.58Q676.38 1236.38 676.38 1242.28V1259.92H673.2V1242.23Q673.2 1237.57 671.36 1235.55Q669.53 1233.53 666.3 1233.53Q662.97 1233.53 660.81 1235.15Q658.66 1236.78 657.65 1239.51V1259.92H654.48V1218.66H657.65Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="a"
          data-weight="light"
          style="--logo-delay: 5.80s"
          d="M702.75 1259.92Q702.45 1258.42 702.31 1257.33Q702.16 1256.25 702.16 1255.11Q700.68 1257.44 698.01 1258.96Q695.34 1260.48 691.88 1260.48Q687.67 1260.48 685.36 1258.24Q683.04 1256.01 683.04 1252.17Q683.04 1248.34 686.4 1245.96Q689.76 1243.58 695.13 1243.58H702.16V1240.03Q702.16 1236.97 700.22 1235.22Q698.28 1233.48 694.73 1233.48Q691.48 1233.48 689.48 1235.06Q687.48 1236.65 687.48 1239.06H684.55L684.5 1238.9Q684.34 1235.67 687.26 1233.22Q690.18 1230.78 694.89 1230.78Q699.6 1230.78 702.45 1233.18Q705.31 1235.59 705.31 1240.09V1254.16Q705.31 1255.67 705.48 1257.09Q705.66 1258.52 706.05 1259.92ZM692.22 1257.68Q695.87 1257.68 698.54 1255.94Q701.21 1254.21 702.16 1251.49V1246.01H695.1Q691.24 1246.01 688.73 1247.85Q686.22 1249.69 686.22 1252.28Q686.22 1254.71 687.82 1256.19Q689.42 1257.68 692.22 1257.68Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="e"
          data-weight="light"
          style="--logo-delay: 5.98s"
          d="M724.62 1260.48Q719.06 1260.48 715.6 1256.55Q712.14 1252.62 712.14 1246.46V1245.01Q712.14 1238.82 715.64 1234.8Q719.14 1230.78 724.33 1230.78Q729.54 1230.78 732.38 1234.12Q735.22 1237.47 735.22 1243.13V1245.59H715.31V1246.46Q715.31 1251.35 717.78 1254.58Q720.25 1257.81 724.62 1257.81Q727.24 1257.81 729.43 1256.95Q731.63 1256.09 733.08 1254.63L734.43 1256.8Q732.92 1258.39 730.48 1259.43Q728.03 1260.48 724.62 1260.48ZM724.33 1233.48Q720.68 1233.48 718.32 1236.09Q715.97 1238.71 715.57 1242.73L715.65 1242.89H732.05V1242.23Q732.05 1238.42 730.05 1235.95Q728.06 1233.48 724.33 1233.48Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="l"
          data-weight="light"
          style="--logo-delay: 6.18s"
          d="M745.17 1259.92H742.02V1218.66H745.17Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="s"
          data-weight="medium"
          style="--logo-delay: 6.63s"
          d="M769.21 1252.1Q769.21 1250.61 767.95 1249.65Q766.7 1248.68 763.21 1247.92Q758.15 1246.88 755.48 1244.87Q752.81 1242.86 752.81 1239.48Q752.81 1235.88 755.85 1233.33Q758.9 1230.78 763.87 1230.78Q769 1230.78 772.13 1233.41Q775.27 1236.04 775.13 1239.74L775.08 1239.9H768.92Q768.92 1238.16 767.54 1236.87Q766.17 1235.59 763.87 1235.59Q761.54 1235.59 760.32 1236.65Q759.11 1237.71 759.11 1239.24Q759.11 1240.7 760.24 1241.57Q761.38 1242.44 764.93 1243.13Q770.19 1244.19 772.86 1246.24Q775.53 1248.29 775.53 1251.72Q775.53 1255.59 772.34 1258.03Q769.16 1260.48 763.95 1260.48Q758.37 1260.48 755.14 1257.62Q751.91 1254.77 752.07 1251.06L752.12 1250.9H758.1Q758.21 1253.39 759.9 1254.53Q761.59 1255.67 764.03 1255.67Q766.49 1255.67 767.85 1254.69Q769.21 1253.71 769.21 1252.1Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="c"
          data-weight="medium"
          style="--logo-delay: 6.82s"
          d="M792.96 1255.35Q795.16 1255.35 796.68 1253.97Q798.2 1252.6 798.2 1250.48H804.02L804.07 1250.64Q804.18 1254.66 800.88 1257.57Q797.59 1260.48 792.96 1260.48Q786.77 1260.48 783.41 1256.39Q780.05 1252.31 780.05 1246.09V1245.17Q780.05 1238.98 783.41 1234.88Q786.77 1230.78 792.93 1230.78Q797.93 1230.78 801.05 1233.78Q804.18 1236.78 804.07 1241.41L804.02 1241.57H798.2Q798.2 1239.21 796.74 1237.57Q795.29 1235.94 792.93 1235.94Q789.5 1235.94 787.99 1238.59Q786.48 1241.25 786.48 1245.17V1246.09Q786.48 1250.09 787.98 1252.72Q789.47 1255.35 792.96 1255.35Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="h"
          data-weight="medium"
          style="--logo-delay: 6.99s"
          d="M815.81 1235.01Q817.24 1233 819.29 1231.89Q821.34 1230.78 823.83 1230.78Q828.38 1230.78 830.93 1233.65Q833.48 1236.52 833.48 1242.49V1259.92H827.05V1242.44Q827.05 1239.08 825.74 1237.56Q824.44 1236.04 821.84 1236.04Q819.78 1236.04 818.27 1236.77Q816.77 1237.5 815.81 1238.79V1259.92H809.39V1218.66H815.81Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="r"
          data-weight="medium"
          style="--logo-delay: 7.21s"
          d="M854.4 1237.1 851.65 1236.99Q849.77 1236.99 848.52 1237.79Q847.26 1238.58 846.57 1240.03V1259.92H840.15V1231.31H846.02L846.44 1235.46Q847.52 1233.26 849.23 1232.02Q850.94 1230.78 853.16 1230.78Q853.74 1230.78 854.24 1230.87Q854.75 1230.96 855.17 1231.09Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="e"
          data-weight="medium"
          style="--logo-delay: 7.39s"
          d="M870.8 1260.48Q864.53 1260.48 861 1256.53Q857.47 1252.57 857.47 1246.28V1245.22Q857.47 1238.92 861 1234.84Q864.53 1230.75 870.11 1230.78Q875.88 1230.78 878.84 1234.33Q881.8 1237.89 881.8 1243.84V1247.31H864.11L864.05 1247.44Q864.16 1250.96 865.91 1253.15Q867.65 1255.35 871.17 1255.35Q873.79 1255.35 875.71 1254.71Q877.62 1254.08 879.26 1252.89L881.35 1257.09Q879.71 1258.52 877.01 1259.5Q874.32 1260.48 870.8 1260.48ZM870.11 1235.94Q867.6 1235.94 866.09 1237.75Q864.58 1239.56 864.21 1242.47L864.27 1242.6H875.45V1242.1Q875.45 1239.35 874.17 1237.64Q872.89 1235.94 870.11 1235.94Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="i"
          data-weight="medium"
          style="--logo-delay: 7.55s"
          d="M893.86 1259.92H887.44V1231.31H893.86ZM893.86 1224.3H887.44V1218.66H893.86Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="b"
          data-weight="medium"
          style="--logo-delay: 7.79s"
          d="M926.18 1246.57Q926.18 1252.84 923.26 1256.66Q920.34 1260.48 915.02 1260.48Q912.32 1260.48 910.34 1259.37Q908.36 1258.26 907.03 1256.14L906.27 1259.92H901.06V1218.66H907.48V1234.56Q908.81 1232.73 910.66 1231.76Q912.51 1230.78 914.97 1230.78Q920.34 1230.78 923.26 1234.96Q926.18 1239.14 926.18 1246.01ZM919.76 1246.01Q919.76 1241.54 918.22 1238.79Q916.69 1236.04 913.36 1236.04Q911.21 1236.04 909.77 1236.99Q908.33 1237.95 907.48 1239.64V1251.65Q908.3 1253.36 909.76 1254.3Q911.21 1255.24 913.41 1255.24Q916.74 1255.24 918.25 1252.9Q919.76 1250.56 919.76 1246.57Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="e"
          data-weight="medium"
          style="--logo-delay: 7.98s"
          d="M943.88 1260.48Q937.61 1260.48 934.08 1256.53Q930.55 1252.57 930.55 1246.28V1245.22Q930.55 1238.92 934.08 1234.84Q937.61 1230.75 943.19 1230.78Q948.96 1230.78 951.92 1234.33Q954.88 1237.89 954.88 1243.84V1247.31H937.19L937.13 1247.44Q937.24 1250.96 938.98 1253.15Q940.73 1255.35 944.25 1255.35Q946.87 1255.35 948.78 1254.71Q950.7 1254.08 952.34 1252.89L954.43 1257.09Q952.79 1258.52 950.09 1259.5Q947.39 1260.48 943.88 1260.48ZM943.19 1235.94Q940.68 1235.94 939.17 1237.75Q937.66 1239.56 937.29 1242.47L937.34 1242.6H948.53V1242.1Q948.53 1239.35 947.25 1237.64Q945.97 1235.94 943.19 1235.94Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="r"
          data-weight="medium"
          style="--logo-delay: 8.18s"
          d="M974.35 1237.1 971.6 1236.99Q969.72 1236.99 968.46 1237.79Q967.2 1238.58 966.52 1240.03V1259.92H960.09V1231.31H965.96L966.39 1235.46Q967.47 1233.26 969.18 1232.02Q970.88 1230.78 973.1 1230.78Q973.68 1230.78 974.19 1230.87Q974.69 1230.96 975.11 1231.09Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="."
          data-weight="light"
          style="--logo-delay: 8.58s"
          d="M983.76 1259.92H980.14V1255.59H983.76Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="n"
          data-weight="light"
          style="--logo-delay: 8.80s"
          d="M995.64 1231.31 995.93 1236.28Q997.33 1233.66 999.66 1232.22Q1001.98 1230.78 1005.18 1230.78Q1009.84 1230.78 1012.27 1233.62Q1014.71 1236.46 1014.71 1242.49V1259.92H1011.53V1242.52Q1011.53 1237.6 1009.69 1235.56Q1007.86 1233.53 1004.47 1233.53Q1001.08 1233.53 999.01 1235.19Q996.93 1236.86 996.01 1239.66V1259.92H992.83V1231.31Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="e"
          data-weight="light"
          style="--logo-delay: 8.98s"
          d="M1033.85 1260.48Q1028.3 1260.48 1024.84 1256.55Q1021.37 1252.62 1021.37 1246.46V1245.01Q1021.37 1238.82 1024.87 1234.8Q1028.38 1230.78 1033.56 1230.78Q1038.77 1230.78 1041.62 1234.12Q1044.46 1237.47 1044.46 1243.13V1245.59H1024.54V1246.46Q1024.54 1251.35 1027.02 1254.58Q1029.49 1257.81 1033.85 1257.81Q1036.47 1257.81 1038.67 1256.95Q1040.86 1256.09 1042.32 1254.63L1043.67 1256.8Q1042.16 1258.39 1039.71 1259.43Q1037.27 1260.48 1033.85 1260.48ZM1033.56 1233.48Q1029.91 1233.48 1027.56 1236.09Q1025.21 1238.71 1024.81 1242.73L1024.89 1242.89H1041.29V1242.23Q1041.29 1238.42 1039.29 1235.95Q1037.29 1233.48 1033.56 1233.48Z"
        />
        <path
          class="animated-logo__glyph"
          data-char="t"
          data-weight="light"
          style="--logo-delay: 9.18s"
          d="M1055.81 1223.98V1231.31H1062.1V1233.9H1055.81V1252.54Q1055.81 1255.35 1056.83 1256.53Q1057.84 1257.7 1059.54 1257.7Q1060.12 1257.7 1060.66 1257.64Q1061.2 1257.57 1061.94 1257.41L1062.42 1259.77Q1061.78 1260.08 1060.85 1260.28Q1059.91 1260.48 1058.98 1260.48Q1055.97 1260.48 1054.29 1258.58Q1052.61 1256.67 1052.61 1252.54V1233.9H1047.66V1231.31H1052.61V1223.98Z"
        />
        <rect
          class="animated-logo__cursor"
          x="566.19"
          y="1218.66"
          width="22"
          height="41.26"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
</template>
<style scoped>
.animated-logo {
  display: block;
  aspect-ratio: 1;
}

.animated-logo__trace {
  stroke-dasharray: 1 2;
  stroke-dashoffset: 0;
  animation: logo-draw var(--logo-duration) linear var(--logo-delay) both;
}

.animated-logo__dot--d3 {
  animation: logo-pop 0.15s ease-out var(--logo-delay) both;
}

.animated-logo__dot--d1,
.animated-logo__hole--d1 {
  animation:
    logo-move-d1 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__dot--d2,
.animated-logo__hole--d2 {
  animation:
    logo-move-d2 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__dot--d4,
.animated-logo__hole--d4 {
  animation:
    logo-move-d4 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__dot--d5,
.animated-logo__hole--d5 {
  animation:
    logo-move-d5 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__dot--d6,
.animated-logo__hole--d6 {
  animation:
    logo-move-d6 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__dot--d7,
.animated-logo__hole--d7 {
  animation:
    logo-move-d7 var(--logo-duration) linear var(--logo-delay) both,
    logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__head,
.animated-logo__hole--p4,
.animated-logo__hole--p7,
.animated-logo__hole--p8 {
  opacity: 0;
}

.animated-logo__head--p4,
.animated-logo__hole--p4 {
  animation:
    logo-move-p4 var(--logo-duration) linear var(--logo-delay) none,
    logo-head-on var(--logo-duration) linear var(--logo-delay) none;
}

.animated-logo__head--p7,
.animated-logo__hole--p7 {
  animation:
    logo-move-p7 var(--logo-duration) linear var(--logo-delay) none,
    logo-head-on var(--logo-duration) linear var(--logo-delay) none;
}

.animated-logo__head--p8,
.animated-logo__hole--p8 {
  animation:
    logo-move-p8 var(--logo-duration) linear var(--logo-delay) none,
    logo-head-on var(--logo-duration) linear var(--logo-delay) none;
}

.animated-logo__glyph {
  animation: logo-show 1ms steps(1, start) var(--logo-delay) both;
}

.animated-logo__cursor {
  opacity: 0;
  animation:
    logo-cursor-blink 6.88s steps(1, end) 3.8s none,
    logo-cursor-move 5.68s steps(1, end) 5s none;
}

@keyframes logo-draw {
  from {
    stroke-dashoffset: 1.01;
  }
}

@keyframes logo-pop {
  from {
    opacity: 0;
  }
}

@keyframes logo-show {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes logo-head-on {
  from,
  to {
    opacity: 1;
  }
}

@keyframes logo-move-d1 {
  0% {
    transform: translate(165.07px, -167.27px);
  }
  40.5% {
    transform: translate(63.27px, -67.04px);
  }
  65.9% {
    transform: translate(0px, -130.32px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-d2 {
  0% {
    transform: translate(192.87px, -9.21px);
  }
  54.4% {
    transform: translate(91.83px, 91.83px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-d4 {
  0% {
    transform: translate(0px, -69.45px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-d5 {
  0% {
    transform: translate(-87.33px, 96.68px);
  }
  44.7% {
    transform: translate(24.26px, 96.68px);
  }
  68.9% {
    transform: translate(69.52px, 56.88px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-d6 {
  0% {
    transform: translate(-29.65px, 117.96px);
  }
  49% {
    transform: translate(-121.73px, 39.92px);
  }
  72.8% {
    transform: translate(-78.03px, 0.91px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-d7 {
  0% {
    transform: translate(-96.76px, 74.91px);
  }
  29.5% {
    transform: translate(-95.98px, 33.55px);
  }
  64% {
    transform: translate(-60.87px, 0px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-p4 {
  0% {
    transform: translate(-114.64px, 134.13px);
  }
  45.5% {
    transform: translate(37.53px, 134.13px);
  }
  59.3% {
    transform: translate(71.08px, 102.14px);
  }
  72.6% {
    transform: translate(70.3px, 57.66px);
  }
  73% {
    transform: translate(69.52px, 56.88px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-p7 {
  0% {
    transform: translate(-28.65px, 28.65px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-move-p8 {
  0% {
    transform: translate(0px, 177.14px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}

@keyframes logo-cursor-blink {
  0% {
    opacity: 1;
  }
  7.267% {
    opacity: 0;
  }
  14.535% {
    opacity: 1;
  }
  85.465% {
    opacity: 0;
  }
  92.733% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes logo-cursor-move {
  0% {
    transform: translateX(42.86px);
  }
  2.993% {
    transform: translateX(54.66px);
  }
  6.69% {
    transform: translateX(84.6px);
  }
  10.035% {
    transform: translateX(113.19px);
  }
  14.085% {
    transform: translateX(142.86px);
  }
  17.254% {
    transform: translateX(172.03px);
  }
  20.775% {
    transform: translateX(181.98px);
  }
  28.697% {
    transform: translateX(212.34px);
  }
  32.042% {
    transform: translateX(240.99px);
  }
  35.035% {
    transform: translateX(270.29px);
  }
  38.908% {
    transform: translateX(291.98px);
  }
  42.077% {
    transform: translateX(318.61px);
  }
  44.894% {
    transform: translateX(330.67px);
  }
  49.12% {
    transform: translateX(362.99px);
  }
  52.465% {
    transform: translateX(391.69px);
  }
  55.986% {
    transform: translateX(411.92px);
  }
  63.028% {
    transform: translateX(420.57px);
  }
  66.901% {
    transform: translateX(451.52px);
  }
  70.07% {
    transform: translateX(481.27px);
  }
  73.592% {
    transform: translateX(499.23px);
  }
  100% {
    transform: translateX(499.23px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-logo__trace,
  .animated-logo__dot,
  .animated-logo__head,
  .animated-logo__hole,
  .animated-logo__glyph,
  .animated-logo__cursor {
    animation: none;
  }
}
</style>
