// prettier-ignore
export const CONNECTIONS = Object.freeze({
  NS: { name: "NS", connects: [[ -1 ,0 ], [ 1, 0 ]]},
  EW: { name: "EW", connects: [[ 0, -1 ], [ 0, 1 ]]},
  NW: { name: "NW", connects: [[ -1 ,0 ], [ 0, -1 ]]},
  NE: { name: "NE", connects: [[ -1 ,0 ], [ 0, 1]]},
  SW: { name: "SW", connects: [[ 1, 0 ] ,[ 0, -1 ]]},
  SE: { name: "SE", connects: [[ 1, 0] ,[ 0 , 1 ]]},
});

export const CURVED_CONNECTIONS = ["NW", "NE", "SW", "SE"];
