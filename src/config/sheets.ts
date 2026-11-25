/** Google Sheet tab names. The backend bot fills the read-only tabs. */
export const tabs = {
  importantDates: "Important Dates",
  stats: "Stats",
  listingFiles: "Listing Files",
  outstandingNotary: "Outstanding Notary",
  pendingSubjects: "Pending Subjects",
  newListings: "New Listings",
  pond: "Request Pond Access",
  removePond: "Remove from Pond",
  buyersGuide: "Request Buyer's Guide",
  sellersGuide: "Request Seller's Guide",
  featureSheets: "Request Feature Sheets",
  messagesKayla: "Messages to Kayla",
  strata: "Strata Documents",
  listingMedia: "Listing Media",
  mls: "MLS Sheet",
  vacation: "Vacation Days",
  notary: "Submit Notary Info",
  removeSubjects: "Remove Subjects",
  meetingTopics: "Meeting Topics",
  cincTickets: "CINC Support Tickets",
  ticketScreenshots: "Ticket Screenshots",
} as const;

export const readTabs = [
  tabs.importantDates,
  tabs.stats,
  tabs.listingFiles,
  tabs.outstandingNotary,
  tabs.pendingSubjects,
  tabs.vacation,
] as const;
