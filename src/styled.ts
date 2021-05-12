import createCss from "@stitches/react";

export const { styled, css } = createCss({
  media: {
    bp1: "(min-width: 320px)",
    bp2: "(min-width: 640px)",
  },
});
