export function composeURL(to: string, query: Record<string, any>) {
  let str = [];
  for (let p in query)
    if (query.hasOwnProperty(p) && typeof query[p] !== 'undefined') {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(query[p]));
    }
  return to + '/?' + str.join('&');
}

export function ucFirst(origin: string) {
  return origin.substring(0, 1).toUpperCase() + origin.substr(1);
}
