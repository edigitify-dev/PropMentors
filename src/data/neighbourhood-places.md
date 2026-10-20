# Neighbourhood place data

`neighbourhood-places.json` contains public place names and coordinates checked
against the six property pages listed in its `sources` field on 20 October 2026.
The records cover metro and bus connections, offices and banks, restaurants and
cafés, hotels, malls, and supermarkets in the catalogue's Noida neighbourhoods.

Only factual place names, coordinates, and categories are retained. Provider
place IDs, route distances, journey times, and unrelated property records are
excluded. The API combines these landmarks with the existing property catalogue,
removes duplicates, and calculates straight-line distances from the current
property. It returns only places within 5 km, ordered from nearest to farthest.

Update the dated dataset when place information changes. Keep the source URLs
and `checkedAt` date current. A missing coordinate must remain missing rather
than being inferred from a nearby property. Those properties use an area search
without distance claims.
