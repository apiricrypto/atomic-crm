import React from "react";

const DealList = React.lazy(() => import("./DealList"));
export const DealListMobile = React.lazy(() =>
  import("./DealList").then((module) => ({ default: module.DealListMobile })),
);

export default {
  list: DealList,
};
