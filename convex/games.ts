import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function findByRoom(ctx: { db: any }, roomCode: string) {
  return await ctx.db
    .query("games")
    .withIndex("by_room", (q: any) => q.eq("roomCode", roomCode))
    .unique();
}

export const getByRoom = query({
  args: { roomCode: v.string() },
  handler: async (ctx, { roomCode }) => {
    const doc = await findByRoom(ctx, roomCode);
    return doc?.state ?? null;
  },
});

export const upsert = mutation({
  args: { roomCode: v.string(), state: v.any() },
  handler: async (ctx, { roomCode, state }) => {
    const doc = await findByRoom(ctx, roomCode);
    if (doc) {
      await ctx.db.patch(doc._id, { state });
    } else {
      await ctx.db.insert("games", { roomCode, state });
    }
  },
});

// Atomic player join. Convex mutations run as
// serializable transactions, so this read-modify-write cannot lose updates.
export const addPlayer = mutation({
  args: { roomCode: v.string(), playerId: v.string(), player: v.any() },
  handler: async (ctx, { roomCode, playerId, player }) => {
    const doc = await findByRoom(ctx, roomCode);
    if (!doc) return null;
    const state = {
      ...doc.state,
      players: { ...(doc.state.players ?? {}), [playerId]: player },
    };
    await ctx.db.patch(doc._id, { state });
    return state;
  },
});

export const remove = mutation({
  args: { roomCode: v.string() },
  handler: async (ctx, { roomCode }) => {
    const doc = await findByRoom(ctx, roomCode);
    if (doc) await ctx.db.delete(doc._id);
  },
});

export const ping = query({
  args: {},
  handler: async (ctx) => {
    await ctx.db.query("games").first();
    return true;
  },
});
