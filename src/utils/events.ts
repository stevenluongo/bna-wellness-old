import { Check, Room } from "@prisma/client";
import moment, { Moment } from "moment";
import { useMemo } from "react";

export const countIntervals = (startTime: Date, endTime: Date) => {
  const start = moment(startTime);
  const end = moment(startTime)
    .hours(moment(endTime).hours())
    .minutes(moment(endTime).minutes())
    .seconds(0)
    .milliseconds(0);
  const duration = moment.duration(end.diff(start));
  const minutes = duration.asMinutes();
  const intervals = Math.floor(minutes / 30);
  return intervals;
};

export const useCurrentWeek = () =>
  useMemo(() => {
    // get start time of room
    const weekStart = moment().startOf("week");

    // get dates for current week
    const dates: Moment[] = [];
    for (let i = 0; i <= 6; i++) {
      dates.push(weekStart.clone().add(i, "days"));
    }

    // return dates
    return { dates, start: weekStart.toISOString() };
  }, []);

export const useBlockedTimes = ({
  checks = [],
  trainerId,
}: {
  checks?: Check[];
  trainerId: string;
}) =>
  useMemo(() => {
    const blockedTimes = new Map();
    const interval = 30; // in minutes
    for (const check of checks) {
      if (check.trainerId !== trainerId) continue;
      const start = moment(check.startTime);
      const end = moment(check.endTime);
      while (start < end) {
        const timeSlot = start.toISOString();
        blockedTimes.set(timeSlot, true);
        start.add(interval, "minutes");
      }
    }
    return blockedTimes;
  }, [checks, trainerId]);

export const useScheduleTimes = (room: Room) =>
  useMemo(() => {
    const times = [];
    const startTime = setMomentTime(moment(), moment(room.startTime));
    const endTime = setMomentTime(moment(), moment(room.endTime));
    for (
      let time = startTime.clone();
      time.isBefore(endTime);
      time.add(30, "minutes")
    ) {
      times.push(time.clone());
    }
    return times;
  }, [room]);

export const setMomentTime = (date: Moment, time: Moment) => {
  return moment(date)
    .clone()
    .hour(time.hour())
    .minute(time.minute())
    .second(0)
    .millisecond(0);
};
