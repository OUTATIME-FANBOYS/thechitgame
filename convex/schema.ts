import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    roomCode: v.string(),
    state: v.any(),
  }).index("by_room", ["roomCode"]),
});
