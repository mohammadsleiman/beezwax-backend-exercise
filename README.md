# Beezwax's Backend Node Exercise

## Instructions

You are tasked with creating an API to access information about a global satellite transponder network. The network is constructed such that local satellites only communicate to a single parent satellite. Those parent satellites then communicate to their parents, and so on. There can be any number of levels of nesting and there may be multiple root top level satellites.

The transponder data is stored in a sqlite database available at `db/transponders.db`.

**Your tasks:**
1) Create a `/transponders` endpoint which returns a JSON array of all top level transponders. Each transponder should contain the following information: `id`, `name`, `children`. An example:

```json
{
  "transponders": [
    {
      "id": 1,
      "name": "a",
      "children": [{ "id": 2, "name": "b", "children": [] }]
    }
  ]
}
```

2) Add a `/count` endpoint that takes an optional `id` parameter. If `id` is not specified the endpoint should return the total number of nodes present in the system. If `id` is specified it should return the number of *immediate* children for the given transponder.

## Installation

```
npm install
npm start
```
