import React from 'react';
import { withRouter } from 'next/router'
import Link from 'next/link'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Page from '../layouts/main'
import Breadcrumbs from '../components/Breadcrumbs';
import NavTabs from '../components/NavTabs';
import DeploymentData from '../components/Deployments';
import Logs from '../components/Logs';
import moment from 'moment';
import { bp, color, fontSize } from '../variables';

const query = gql`
  query getEnvironment($openshiftProjectName: String!){
    environmentByOpenshiftProjectName(openshiftProjectName: $openshiftProjectName) {
      id
      name
      created
      updated
      deployType
      environmentType
      routes
      openshiftProjectName
      project {
        name
      }
      deployments {
        id
        name
        status
        started
        remoteId
        completed
      }
    }
  }
`;
const Deployments = withRouter((props) => {
  return (
    <Page>
      <Query query={query} variables={{openshiftProjectName: props.router.query.name}}>
        {({ loading, error, data }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;
          const environment = data.environmentByOpenshiftProjectName;
          const breadcrumbs = [
            {
              header: 'Project',
              title: environment.project.name,
              pathname: '/project',
              query: {name: environment.project.name}
            },
            {
              header: 'Environment',
              title: environment.name,
              pathname: '/environment',
              query: { name: environment.openshiftProjectName }
            }
          ];
          return (
            <React.Fragment>
              <Breadcrumbs breadcrumbs={breadcrumbs}/>
              <div className='content-wrapper'>
                <NavTabs activeTab='deployments' environment={environment.openshiftProjectName}/>
                {!props.router.query.build &&
                  <DeploymentData projectName={environment.openshiftProjectName} deployments={environment.deployments} />
                }
                {props.router.query.build &&
                  environment.deployments
                  .filter(deployment => deployment.name === props.router.query.build)
                  .map(deployment =>
                    <Logs key={deployment.name} deployment={deployment} />
                  )
                }
              </div>
              <style jsx>{`
              .content-wrapper {
                @media ${bp.tabletUp} {
                  display: flex;
                  padding: 0;
                }
              }
            `}</style>
            </React.Fragment>
          );
        }}
      </Query>
    </Page>
  )
});

export default Deployments;
