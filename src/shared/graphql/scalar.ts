import { gql } from "graphql-tag";
import { DateTimeResolver } from "graphql-scalars";

export const scalarTypeDefs = gql`
  """
  ISO 8601 date-time string (e.g. "2026-07-15T10:30:00.000Z"). Serializes
  from server-side Date objects and parses back into Date objects for
  resolver arguments — this replaces plain String on every date/time
  field so values are never accidentally stringified via Date's numeric
  valueOf() (which produces a raw epoch-millisecond string instead of an
  ISO date, and silently fails to parse back into a valid Date on the
  client).
  """
  scalar DateTime
`;

export const scalarResolvers = {
  DateTime: DateTimeResolver,
};