"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import { PeopleTable as DesktopTable } from "./people-table"
import { PeopleTable as MobileTable } from "./people-table-mobile"

export function ResponsivePeopleTable() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return isDesktop ? <DesktopTable /> : <MobileTable />
}