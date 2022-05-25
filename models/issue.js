const createIssueSchema = async (conn) => {
  //console.log(conn)
  const collections = await conn.db("dbissue").collections();
  console.log(collections.map(c => c.s.namespace.collection).includes("issues"))
  if (!collections.map(c => c.s.namespace.collection).includes("issues")) {
    await conn.db("dbissue").createCollection("issues", {
      capped: false,
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["project", "issue_title", "issue_text"],
          properties: {
            project: {
              bsonType: "string",
              description: "Please provide a projectname"
            },
            issue_title: {
              bsonType: "string",
              description: "Please provide a title"
            },
            issue_text: {
              bsonType: "string",
              description: "Please provide an issue text"
            },
            created_by: {
              bsonType: "string",
              maxLength: 24
            },
            assigned_to: {
              bsonType: "string",
              maxLength: 24
            },
            status_text: {
              bsonType: "string",
              maxLength: 125
            },
            open: {
              bsonType: "bool",
            }
          }
        }
      },
      validationLevel: "strict",
      validationAction: "error",
    });
  }
}

module.exports = createIssueSchema;

/** 
  await conn.db("dbissue").createCollection("issues", {
    capped: false,
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["project", "issue_title", "issue_text"],
        properties: {
          project: {
            bsonType: "string",
            description: "Please provide a projectname"
          },
          issue_title: {
            bsonType: "string",
            description: "Please provide a title"
          },
          issue_text: {
            bsonType: "string",
            description: "Please provide an issue text"
          },
          created_by: {
            bsonType: "string",
            maxLength: 24
          },
          assigned_to: {
            bsonType: "string",
            maxLength: 24
          },
          status_text: {
            bsonType: "string",
            maxLength: 125
          },
          open: {
            bsonType: "bool",
          }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error",
  });

const ValidIssue =
{
  collMod: "issue",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["project", "issue_title", "issue_text"],
      properties: {
        project: {
          bsonType: "string",
          description: "Please provide a projectname"
        },
        issue_title: {
          bsonType: "string",
          description: "Please provide a title"
        },
        issue_text: {
          bsonType: "string",
          description: "Please provide an issue text"
        },
        created_by: {
          bsonType: "string"
        },
        assigned_to: {
          bsonType: "string",
          maxLength: "24",
          default: ''
        },
        status_text: {
          bsonType: "string",
          maxLength: "24",
          default: ''
        },
        open: {
          bsonType: "boolean",
          maxLength: "24",
          default: true
        }
      }
    }
  }
}
  */