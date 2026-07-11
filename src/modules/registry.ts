/** HazardApp registration point — the shell reads modules from here. */
import { registerHazardApp } from "@/sdk";
import { floodWatch } from "./flood";

registerHazardApp(floodWatch);