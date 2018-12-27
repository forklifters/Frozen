import { SagaIterator } from "redux-saga";
import { fork, take, call, put, select, all } from "redux-saga/effects";
import actionCreators, { ActionTypes } from "./actionCreators";
import bindDependencies from "../utils/bindDependencies";
import Types from "../services/Types";
import { DBServiceInterface } from "../services/DBService";
import { LocalStorageServiceInterface } from "../services/LocalStorageService";
import { MarkdownFile, Workspace } from "../types";
import _ from "lodash";
import { findNoteTitle } from "../utils";
import { generateWorkspace } from "../utils/generateWorkspace";
import { State } from "./reducer";

function* initSaga(
  db: DBServiceInterface,
  localStorage: LocalStorageServiceInterface
): SagaIterator {
  yield take(ActionTypes.INIT);
  const currentFileId: string | null = yield call(localStorage.getCurrentFile);

  const workspaces: Workspace[] = yield call(db.getWorkspaces);

  let currentWorkspaceId: string | null;

  currentWorkspaceId = yield call(localStorage.getCurrentWorkspace);

  if (workspaces.length === 0) {
    const newWorkspace = generateWorkspace("Default Workspace");
    yield call(db.addWorkspace, newWorkspace);
    const files: MarkdownFile[] = yield call(db.getFiles);
    // migrate
    yield all(files.map(file => call(db.updateFile, file, newWorkspace.id)));
    workspaces.push(newWorkspace);
    currentWorkspaceId = newWorkspace.id;
  }

  const isIncludeId = workspaces.some(
    workspace => workspace.id === currentWorkspaceId
  );

  if (currentWorkspaceId == null || !isIncludeId) currentWorkspaceId = "";

  const files: MarkdownFile[] = yield call(
    db.getFilesByWorkspaceId,
    currentWorkspaceId
  );

  yield put(
    actionCreators.setInitialization(
      files,
      workspaces,
      currentFileId,
      currentWorkspaceId
    )
  );
}

function* addFileSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.ADD_FILE);
    const { file } = payload;
    const currentWorkspaceId = yield select(
      (state: State) => state.currentWorkspaceId
    );
    yield call(db.addFile, file, currentWorkspaceId);
    yield put({ type: ActionTypes.SET_NEW_FILE, payload: { file } });
  }
}

function* deleteFileSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.DELTE_FILE);
    const { file } = payload;
    yield call(db.deleteFile, file.id);
    const newFiles: MarkdownFile[] = yield call(db.getFiles);
    yield put(actionCreators.setDeletedFiles(newFiles));
  }
}

function* updateFileSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.UPDATE_FILE);
    const { id, content } = payload;
    const file = {
      id,
      content,
      title: findNoteTitle(content)
    };
    const currentWorkspaceId = yield select(
      (state: State) => state.currentWorkspaceId
    );
    yield call(_.debounce(db.updateFile, 100), file, currentWorkspaceId);
    yield put(actionCreators.setUpdatedFile(file));
  }
}

function* switchCurrentFileSaga(
  localStorage: LocalStorageServiceInterface
): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.SWITCH_CURRENT_FILE);
    const { file } = payload;
    yield call(localStorage.setCurrentFile, file);
    yield put({ type: ActionTypes.SET_CURRENT_FILE, payload: { file } });
  }
}

function* addWorkspaceSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.ADD_WORKSPACE);
    const { workspace }: { workspace: Workspace } = payload;
    yield call(db.addWorkspace, workspace);
    yield put(actionCreators.setNewWorkspaces(workspace));
  }
}

function* updateWorkspaceSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.UPDATE_WORKSPACE);
    const { id, name, color } = payload;
    const workspace = {
      id,
      name,
      color
    };
    yield call(db.updateWorkspace, workspace);
    yield put(actionCreators.setUpdatedWorkspace(workspace));
  }
}

function* deleteWorkspaceSaga(db: DBServiceInterface): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.DELETE_WORKSPACE);
    const { id } = payload;
    const oldWorkspaces = yield select((state: State) => state.workspaces);
    if (oldWorkspaces.length === 1) {
      yield call(db.deleteWorkspace, id);
      const workspaces: Workspace[] = yield call(db.getWorkspaces);
      yield put(actionCreators.setDeletedWorkspace(workspaces));
    } else {
      console.info("Workspaces should be least one.");
    }
  }
}

function* switchCurrentWorkspaceSaga(
  db: DBServiceInterface,
  localStorage: LocalStorageServiceInterface
): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.SWITCH_WORKSPACE);
    const { workspaceId } = payload;
    const files: MarkdownFile[] = yield call(
      db.getFilesByWorkspaceId,
      workspaceId
    );
    yield call(localStorage.setCurrentWorkspace, workspaceId);
    yield put(actionCreators.setSwitchedWorkspace(workspaceId, files));
  }
}

export default function* saga(): SagaIterator {
  yield fork(
    bindDependencies(initSaga, [Types.DBService, Types.LocalStorageService])
  );
  yield fork(bindDependencies(addFileSaga, [Types.DBService]));
  yield fork(bindDependencies(deleteFileSaga, [Types.DBService]));
  yield fork(bindDependencies(updateFileSaga, [Types.DBService]));
  yield fork(
    bindDependencies(switchCurrentFileSaga, [Types.LocalStorageService])
  );
  yield fork(bindDependencies(addWorkspaceSaga, [Types.DBService]));
  yield fork(bindDependencies(updateWorkspaceSaga, [Types.DBService]));
  yield fork(bindDependencies(deleteWorkspaceSaga, [Types.DBService]));
  yield fork(
    bindDependencies(switchCurrentWorkspaceSaga, [
      Types.DBService,
      Types.LocalStorageService
    ])
  );
}
