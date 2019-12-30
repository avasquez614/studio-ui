/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { get, post } from "../utils/ajax";

export function fetchPackages(siteId: string, filters: any) {
  let queryS = new URLSearchParams(filters).toString();
  return get(`/studio/api/2/publish/packages?siteId=${siteId}&${queryS}`)
}

export function fetchPackage(siteId: string, packageId: string) {
  return get(`/studio/api/2/publish/package?siteId=${siteId}&packageId=${packageId}`)
}

export function cancelPackage(siteId: string, packageIds: any) {
  return post('/studio/api/2/publish/cancel', {siteId, packageIds}, {
    'Content-Type': 'application/json'
  })
}

export function fetchEnvironments(siteId: string) {
  return get(`/studio/api/1/services/api/1/deployment/get-available-publishing-channels.json?site_id=${siteId}`)
}

export default {
  fetchPackages,
  fetchPackage,
  cancelPackage,
  fetchEnvironments
}
