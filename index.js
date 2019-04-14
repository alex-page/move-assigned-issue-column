const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    // Get the arguments
    const projectName = tools.arguments._[ 0 ];
    const columnName    = tools.arguments._[ 1 ];

    // Get the data from the event
    const issue = tools.context.payload.issue;

    // Check if there are existing asignees
    if( issue.assignee.length ) {
      const assigneeLogins = issue.assignee.map( data => data.login ).join( ', ' );
      tools.exit.neutral( `${ assigneeLogins } are already assigned. Leaving ${ issue.title } in current column.` );
    }

    // Fetch the column ids and names
    const { resource } = await tools.github.graphql(`query {
      resource( url: "${ issue.html_url }" ) {
        ... on Issue {
          projectCards {
            nodes {
              id
              column {
                name
              }
            }
          }
          repository {
            projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
              nodes {
                columns( first: 100 ) {
                  nodes {
                    id
                    name
                  }
                }
              }
            }
            owner {
              ... on Organization {
                projects( search: "${ projectName }", first: 10, states: [OPEN] ) {
                  nodes {
                    columns( first: 100 ) {
                      nodes {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`);

    // Get the card id and the column name
    const cardId = resource.projectCards.nodes 
      && resource.projectCards.nodes.id
      || null;

    const currentColumn = resource.projectCards.nodes 
      && resource.projectCards.nodes.column.name 
      || null;

    if( !cardId || !currentColumn ){
      tools.exit.failure( `The issue ${ issue.title } is not in a project.` );
    }

    if( currentColumn === columnName ){
      tools.exit.neutral( `The issue ${ issue.title } is already in ${ columnName }.` );
    }

    tools.log( cardId, currentColumn );

    // Get an array of all matching projects
    const repoProjects = resource.repository.projects.nodes || [];
    const orgProjects = resource.repository.owner
      && resource.repository.owner.projects
      && resource.repository.owner.projects.nodes
      || [];

    tools.log( repoProjects );
    tools.log( orgProjects );
    
    // Get the columns with matching names
    const columns = [ ...repoProjects, ...orgProjects ]
      .flatMap( projects => {
        return projects.columns.nodes
          ? projects.columns.nodes.filter( column => column.name === columnName )
          : [];
      });

    tools.log( columns );

    // Check we have a valid column ID
    if( !columns.length ) {
      tools.exit.failure( `Could not find "${ projectName }" with "${ columnName }" column` );
    }

    // Add the cards to the columns
    const createCards = columns.map( column => {
      return new Promise( async( resolve, reject ) => {
        try {
          await tools.github.graphql(`mutation {
            moveCard( input: { cardId: "${ cardId }", columnId: "${ column.id }" }) {
              clientMutationId
            }
          }`);

          resolve();
        }
        catch( error ){
          reject( error );
        }
      })
    });

    // Wait for completion
    await Promise.all( createCards ).catch( error => tools.exit.failure( error ) );

    // // Log success message
    // tools.log.success(
    //   `Moved assigned issue "${ issueTitle }" to "${ column.name }".`
    // );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'issues.assigned' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
