/** Team agents. Every Agent dropdown reads this list. */
export const agents = [
  "Casey Archibald",
  "Ann-Marie Copping",
  "Anastasiia Borovyk",
  "Cassie Kang",
  "Chantel Machnik",
  "Denisse Moran",
  "Doris Stratoberdha",
  "Kevin Barrett",
] as const;

export type AgentName = (typeof agents)[number];

export function isAgent(value: string): value is AgentName {
  return (agents as readonly string[]).includes(value);
}
