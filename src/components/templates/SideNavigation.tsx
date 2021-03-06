import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Workspace } from "../../lib/types";
import { State } from "../../lib/redux/reducer";
import { dracula } from "../../lib/colors";
import { Dispatch, Action, bindActionCreators } from "redux";
import { switchEditorMode } from "../../lib/redux/actionCreators/EditorMode";
import { switchWorkspace } from "../../lib/redux/actionCreators/CurrentWorkspace";
import IconButton from "../atoms/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faEdit } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";

interface WorkspaceIconProps {
  backgroundColor: string;
  isCurrentWorkspace: boolean;
}

const Container = styled.div`
  background-color: ${dracula.selection};
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const WorkspaceIcon = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 5px;
  margin: 10px auto;
  text-align: center;
  line-height: 35px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${({ backgroundColor }: WorkspaceIconProps) =>
    backgroundColor};
  ${({ isCurrentWorkspace }: WorkspaceIconProps) =>
    isCurrentWorkspace &&
    `
    box-shadow: 0 0 0 3px ${dracula.purple} inset;
  `}
`;
const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;
const CongigurationButton = styled(IconButton)`
  &:hover {
    svg {
      transform: rotate(-45deg);
    }
  }
`;

interface Props {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  openWorkspaceModal: () => void;
  switchWorkspace: (workspaceId: string) => Action;
  switchEditorMode: () => Action;
}

const Renderer: React.FC<Props> = ({
  workspaces,
  currentWorkspaceId,
  openWorkspaceModal,
  switchWorkspace,
  switchEditorMode
}) => {
  return (
    <Container>
      <div>
        {workspaces.map(workspace => (
          <Tooltip
            placement="right"
            trigger={["hover"]}
            overlay={<span>{workspace.name}</span>}
            key={workspace.id}
          >
            <WorkspaceIcon
              isCurrentWorkspace={currentWorkspaceId === workspace.id}
              key={workspace.id}
              backgroundColor={workspace.color}
              onClick={() => {
                switchWorkspace(workspace.id);
              }}
            >
              {workspace.name.charAt(0)}
            </WorkspaceIcon>
          </Tooltip>
        ))}
      </div>
      <ButtonsContainer>
        <IconButton onClick={switchEditorMode}>
          <FontAwesomeIcon icon={faEdit} />
        </IconButton>
        <CongigurationButton onClick={openWorkspaceModal}>
          <FontAwesomeIcon icon={faCog} />
        </CongigurationButton>
      </ButtonsContainer>
    </Container>
  );
};

function mapStateToProps(state: State) {
  return {
    currentWorkspaceId: state.currentWorkspaceId,
    workspaces: state.workspaces
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action<any>>) {
  return {
    ...bindActionCreators(
      {
        switchWorkspace,
        switchEditorMode
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
