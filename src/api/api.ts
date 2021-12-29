import { GraphQLClient } from "graphql-request";
export { gql } from "graphql-request";

export const authToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE2NDA3MzQ4OTIsImF1ZCI6WyJodHRwczovL2FwaS1zYS1lYXN0LTEuZ3JhcGhjbXMuY29tL3YyL2NreHFxd3N6ZTBsc2YwMXhzaDV4ajN4Z2ovbWFzdGVyIiwiaHR0cHM6Ly9tYW5hZ2VtZW50LW5leHQuZ3JhcGhjbXMuY29tIl0sImlzcyI6Imh0dHBzOi8vbWFuYWdlbWVudC5ncmFwaGNtcy5jb20vIiwic3ViIjoiODNjYjJkMjctNjQ1Yi00MWI0LWIzY2UtZmIxMTc0ZjI0MzU3IiwianRpIjoiY2t4cXI2eGswMGx1bDAxejFnYXdhZjV5byJ9.q2iK7Nkm9IXsaktZA8Y31uaU_a8rfjCibWsVcKmcQSbNtTXpxV7kf0FgilpazP4RoL6HnN0GzuhSFuNQFf105vR8U-c-kpLbKvTrNE0MynGWG7cJxdwv1pGrm_HUqY0HAQEYbNiatP7qzktZP9SUDZB05WGxvVerzZJlusPqfdSoCLwCLiseJwdeL7MXG4iw5kq-1jE-FPl4b5_GT-XdGCDtswCycOsZy37rdg8uxtVt0LT0jyv54gvB_aaEjtqEw3fqdTy2NAVN5AMvfazF_lv63S0k2NrUAHXzsSsI85MTJ7VYTX0DTWvfEt_ikT_O4PmP_wornEgajCrSYNzMP6Z0apA8U25Y-Mr8566riafi-VyZp-owT_vvg2eKeXIDdlsYtsjmudEZDC2hWK_9tgSYDeQJ2Mnde1nw6ws5iwoCGw5dT_a9_mAbyF24_DwQFFJK1CKsLWAHsbGBfbEuTEZE1QqOPHcy7ydcYMxaSocudmRvqt4H4TBVp7k-2N4QaWGQp_-Mn1GoRwGBMMrSjSPDZpMUqo1VU2QuLeYPMd3DJDT9KhkQ9sPnekW6GgWe7YUBRvolBpiL6gU_DL-hQXmFpC2py4o76poFtFRjD0eRDUIZbl19WON4Vj6Xut26nIu1FukFoez448Se5_iEZE7l9XTNytpIz45_9ahLUB8";
export const graphcms = new GraphQLClient(
  "https://api-sa-east-1.graphcms.com/v2/ckxqqwsze0lsf01xsh5xj3xgj/master",
  {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }
);

export const request = async (
  query: string,
  variables?: Record<string, any>
) => {
  return graphcms.request(query, {});
};
