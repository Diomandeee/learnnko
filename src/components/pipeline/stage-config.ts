export const STAGE_CONFIG = {
  PROSPECTING: { 
    label: "Prospecting", 
    className: "border-gray-500",
    description: "Initial contact phase"
  },
  QUALIFICATION: { 
    label: "Qualification", 
    className: "border-yellow-500",
    description: "Evaluating fit"
  },
  MEETING: { 
    label: "Meeting", 
    className: "border-blue-500",
    description: "Scheduled meetings"
  },
  PROPOSAL: { 
    label: "Proposal", 
    className: "border-purple-500",
    description: "Proposal sent"
  },
  NEGOTIATION: { 
    label: "Negotiation", 
    className: "border-orange-500",
    description: "Active negotiation"
  },
  PAUSED: { 
    label: "Paused", 
    className: "border-gray-500",
    description: "On hold"
  },
  WON: { 
    label: "Won", 
    className: "border-green-500",
    description: "Deal closed"
  },

  LOST: { 
    label: "Lost", 
    className: "border-red-500",
    description: "Deal lost"
  },
} as const

export type Stage = keyof typeof STAGE_CONFIG
