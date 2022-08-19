DROP TABLE IF EXISTS transponders;
CREATE TABLE transponders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

DROP TABLE IF EXISTS transponder_relations;
CREATE TABLE transponder_relations (
  id INTEGER PRIMARY KEY,
  parentId INTEGER,
  childId INTEGER,
  FOREIGN KEY (parentId) REFERENCES transponders(id),
  FOREIGN KEY (childId) REFERENCES transponders(id)
);

INSERT INTO transponders (id, name)
VALUES
  (0, "a"),
  (1, "b"),
  (2, "c"),
  (3, "d"),
  (4, "e"),
  (5, "f"),
  (6, "g"),
  (7, "h"),
  (8, "i"),
  (9, "j"),
  (10, "k"),
  (11, "l"),
  (12, "m");

INSERT INTO transponder_relations (parentId, childId)
VALUES
  (0, 2),
  (0, 3),
  (0, 4),
  (2, 7),
  (3, 8),
  (4, 9),
  (4, 10),
  (1, 5),
  (1, 6),
  (6, 11),
  (6, 12);
