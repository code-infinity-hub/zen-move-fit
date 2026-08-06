export const Activity = [
  {
    name: "activity",
    path: "/activity/:_id",
    component: () => import("./index.vue")
  },
  {
    name: "activity-edit",
    path: "/activity/:_id/edit",
    component: () => import("./Edit.vue")
  },
  {
    name: "pending-tags",
    path: "/activity/tags/pending",
    component: () => import("./PendingTags.vue")
  }
];