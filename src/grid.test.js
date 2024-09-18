import Grid from "./grid";

describe("next valid steps tests", () => {
  test("connections off grid", () => {
    const grid = new Grid(4);
    const nextSteps = grid.getValidNextSteps(new Set(), {
      r: 0,
      c: 0,
      connection: "NE",
    });
    expect(nextSteps).toStrictEqual([]);
  });

  test("connect to unused tile", () => {
    const grid = new Grid(4);
    const nextSteps = grid.getValidNextSteps(new Set(), {
      r: 0,
      c: 0,
      connection: "NW",
    });
    expect(nextSteps).toStrictEqual([
      { r: 0, c: 1, connection: "EW" },
      { r: 0, c: 1, connection: "NE" },
      { r: 0, c: 1, connection: "SE" },
    ]);
  });

  test("connect to used tile", () => {
    const grid = new Grid(4);
    grid.squares[0][1].connections.NE = true;
    const nextSteps = grid.getValidNextSteps(new Set(), {
      r: 0,
      c: 0,
      connection: "NW",
    });
    expect(nextSteps).toStrictEqual([
      { r: 0, c: 1, connection: "EW" },
      { r: 0, c: 1, connection: "SE" },
    ]);
  });

  test("connect to multiple tiles", () => {
    const grid = new Grid(4);
    const nextSteps = grid.getValidNextSteps(new Set(), {
      r: 1,
      c: 1,
      connection: "EW",
    });
    expect(nextSteps.length).toEqual(6);
  });
});
