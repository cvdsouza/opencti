import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles/index';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import MoreVert from '@material-ui/icons/MoreVert';
import graphql from 'babel-plugin-relay/macro';
import inject18n from '../../../components/i18n';
import { QueryRenderer, commitMutation } from '../../../relay/environment';
import StixDomainEntityExport from '../stix_domain_entity/StixDomainEntityExport';
import { reportEditionQuery } from './ReportEdition';
import ReportEditionContainer from './ReportEditionContainer';

const styles = theme => ({
  container: {
    margin: 0,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const ReportPopoverDeletionMutation = graphql`
  mutation ReportPopoverDeletionMutation($id: ID!) {
    reportEdit(id: $id) {
      delete
    }
  }
`;

class ReportPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayExport: false,
      displayDelete: false,
      displayEdit: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    commitMutation({
      mutation: ReportPopoverDeletionMutation,
      variables: {
        id: this.props.reportId,
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleClose();
        this.props.history.push('/dashboard/reports/all');
      },
    });
  }

  handleOpenEdit() {
    this.setState({ displayEdit: true });
    this.handleClose();
  }

  handleCloseEdit() {
    this.setState({ displayEdit: false });
  }

  handleOpenExport() {
    this.setState({ displayExport: true });
    this.handleClose();
  }

  handleCloseExport() {
    this.setState({ displayExport: false });
  }

  render() {
    const { classes, t, reportId } = this.props;
    return (
      <div className={classes.container}>
        <IconButton onClick={this.handleOpen.bind(this)} aria-haspopup="true">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenExport.bind(this)}>
            {t('Export')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.displayDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this report?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}
            >
              {t('Cancel')}
            </Button>
            <Button
              onClick={this.submitDelete.bind(this)}
              color="primary"
              disabled={this.state.deleting}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Drawer
          open={this.state.displayEdit}
          anchor="right"
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <QueryRenderer
            query={reportEditionQuery}
            variables={{ id: reportId }}
            render={({ props }) => {
              if (props) {
                return (
                  <ReportEditionContainer
                    me={props.me}
                    report={props.report}
                    handleClose={this.handleCloseEdit.bind(this)}
                  />
                );
              }
              return <div> &nbsp; </div>;
            }}
          />
        </Drawer>
        <StixDomainEntityExport
          stixDomainEntityId={reportId}
          stixDomainEntityType="report"
          handleClose={this.handleCloseExport.bind(this)}
          open={this.state.displayExport}
        />
      </div>
    );
  }
}

ReportPopover.propTypes = {
  reportId: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(ReportPopover);
