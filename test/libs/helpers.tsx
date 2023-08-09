export const sleep = async (dur: number) =>
  new Promise((resolve) => setTimeout(resolve, dur));
