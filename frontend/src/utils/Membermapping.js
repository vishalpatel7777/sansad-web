/**
 * Member Mapping Utility
 * Maps route parameter `id` to API `srno`
 */

let memberCache = null;

/**
 * Get member's srno from route id
 * @param {string|number} id - Route parameter id
 * @returns {Promise<number>} - API srno
 */
export async function getMemberSrno(id) {
  // Initialize cache if needed
  if (!memberCache) {
    const { getMembers } = await import("./api");
    try {
      const response = await getMembers();
      memberCache = response?.data ?? [];
    } catch (error) {
      console.error("Failed to load member cache:", error);
      memberCache = [];
    }
  }

  // Find member by id
  const member = memberCache.find((m) => m.id === Number(id));

  // Return srno or fallback to id
  return member?.srno ?? Number(id);
}

/**
 * Get full member object from route id
 * @param {string|number} id - Route parameter id
 * @returns {Promise<object|null>} - Member object
 */
export async function getMemberById(id) {
  if (!memberCache) {
    const { getMembers } = await import("./api");
    try {
      const response = await getMembers();
      memberCache = response?.data ?? [];
    } catch (error) {
      console.error("Failed to load member cache:", error);
      memberCache = [];
    }
  }

  return memberCache.find((m) => m.id === Number(id)) ?? null;
}

/**
 * Clear member cache (useful for testing or forced refresh)
 */
export function clearMemberCache() {
  memberCache = null;
}

/**
 * Preload member cache (call this in App.jsx or main component)
 */
export async function preloadMemberCache() {
  if (!memberCache) {
    const { getMembers } = await import("./api");
    try {
      const response = await getMembers();
      memberCache = response?.data ?? [];
      console.log(`âœ“ Member cache loaded: ${memberCache.length} members`);
    } catch (error) {
      console.error("Failed to preload member cache:", error);
      memberCache = [];
    }
  }
  return memberCache;
}
