import { Activity } from "@/pages/Activity/routes";
import { AiCoach } from "@/pages/AiCoach/routes";
import { Challenge } from "@/pages/Challenge/routes";
import { Dashboard } from "@/pages/Dashboard/routes";
import { Equipments } from "@/pages/Equipment/routes";
import { League } from "@/pages/League/routes";
import { Loading } from "@/pages/Loading/routes";
import { Login } from "@/pages/Login/routes";
import { Maintenance } from "@/pages/Maintenance/routes";
import { NoConnection } from "@/pages/NoConnection/routes";
import { Profile } from "@/pages/Profile/routes";
import { ReferAndEarn } from "@/pages/ReferAndEarn/routes";
import { Settings } from "@/pages/Settings/routes";
import { Subscription } from "@/pages/Subscription/routes";
import { Training } from "@/pages/Training/routes";

export const routes = [
  ...Activity,
  ...AiCoach,
  ...Challenge,
  ...Dashboard,
  ...Equipments,
  ...League,
  ...Loading,
  ...Login,
  ...Maintenance,
  ...NoConnection,
  ...Profile,
  ...ReferAndEarn,
  ...Settings,
  ...Subscription,
  ...Training,
];