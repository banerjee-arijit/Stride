import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const readableDate = (value) =>
  new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));

export const calculateDuration = (startTime, endTime) => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let startTotalMins = startH * 60 + startM;
  let endTotalMins = endH * 60 + endM;

  if (endTotalMins <= startTotalMins) {
    endTotalMins += 24 * 60;
  }

  const diffMins = endTotalMins - startTotalMins;
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
  
  return parts.join(" ") || "0 mins";
};
