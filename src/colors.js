export const PATH_COLORS = [
  { name: "RED", rgb: hexToRGB("#ff595e") },
  { name: "ORANGE", rgb: hexToRGB("#ff924c") },
  { name: "YELLOW", rgb: hexToRGB("#ffca3a") },
  { name: "GREEN", rgb: hexToRGB("#8ac926") },
  { name: "BLUE", rgb: hexToRGB("#1982c4") },
  { name: "PURPLE", rgb: hexToRGB("#6a4c93") },
];

export const WHITE = hexToRGB("#fff8e8");

function hexToRGB(hexStr) {
  return [
    Number("0x" + hexStr.slice(1, 3)),
    Number("0x" + hexStr.slice(3, 5)),
    Number("0x" + hexStr.slice(5, 7)),
  ];
}
