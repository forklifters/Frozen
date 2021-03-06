import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import styled from "styled-components";
import { Workspace } from "../../lib/types";
import { Action } from "../../lib/redux/types";
import { addWorkspace } from "@lib/redux/actionCreators/Workspace";
import { connect } from "react-redux";
import { Dispatch, Action as ReduxAction, bindActionCreators } from "redux";
import { generateWorkspace } from "../../lib/utils/ItemGenerator";
import Input from "../atoms/Input";

const Container = styled.div`
  display: flex;
`;
const AddWorkspaceInput = styled(Input)`
  width: 100%;
  margin-right: 10px;
`;

interface Props {
  addWorkspace: (workspace: Workspace) => Action;
}

const AddWorkspaceForm: React.FC<Props> = ({ addWorkspace }) => {
  const [inputContent, setInputContent] = useState("");
  return (
    <Container>
      <AddWorkspaceInput
        value={inputContent}
        placeholder="Enter a new workspace name..."
        onChange={(e: ChangeEvent) => {
          const value = (e.target as any).value;
          setInputContent(value);
        }}
        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            const workspace = generateWorkspace(inputContent);
            addWorkspace(workspace);
            setInputContent("");
          }
        }}
      />
    </Container>
  );
};

function mapDispatchToProps(dispatch: Dispatch<ReduxAction<any>>) {
  return {
    ...bindActionCreators(
      {
        addWorkspace
      },
      dispatch
    )
  };
}

export default connect(
  null,
  mapDispatchToProps
)(AddWorkspaceForm);
