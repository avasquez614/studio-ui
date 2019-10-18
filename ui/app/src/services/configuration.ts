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
import { map } from 'rxjs/operators';

export function fetchFileContent(site: string, configPath: string, module: string) {
  return get(`/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`)
    .pipe(
      map(response => response.response)
    );
}

export function fetchFileDOM(site: string, configPath: string, module: string) {
  return fetchFileContent(site, configPath, module).pipe(
    map(response => {
      const xmlString = response ? response.content : '',
                        parser = new DOMParser;
      return parser.parseFromString(xmlString, "text/xml");
    })
  )
}

export default {
  fetchFileContent,
  fetchFileDOM
}
