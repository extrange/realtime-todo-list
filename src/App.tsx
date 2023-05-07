import {
  ActionIcon,
  Button,
  Code,
  Container,
  Flex,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core";
import {
  IconExternalLink,
  IconSquare,
  IconSquareCheck,
  IconTrash
} from "@tabler/icons-react";
import PouchDB from "pouchdb";
import { useEffect, useRef, useState } from "react";
import ReactTimeAgo from "react-time-ago";
import { TaskDisplay } from "./TaskDisplay";

export type Task = {
  title: string;
  notes?: string;
  completed?: string;
  modified?: string;
};

type AppProps = {
  indexedDbSupported: boolean;
};

export const App = ({ indexedDbSupported }: AppProps) => {
  const db = useRef<PouchDB.Database<Task>>();
  const addTaskRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<PouchDB.Core.ExistingDocument<Task>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMsg] = useState<string>("Loading...");

  const createTask = (title: string) =>
    db.current?.put<Task>({ title, _id: Date.now().toString() });

  const updateTask = (t: PouchDB.Core.ExistingDocument<Task>) =>
    db.current?.put(t);

  const deleteTask = (_id: string, _rev: string) => {
    db.current?.remove(_id, _rev);
  };

  const completeTaskToggle = (task: PouchDB.Core.ExistingDocument<Task>) => {
    db.current?.put({
      ...task,
      completed: task.completed ? undefined : new Date().toISOString(),
      modified: new Date().toISOString(),
    });
  };

  /**
   * Update state with changes from a document/deletions
   * @param change change as emitted from `.on` listener
   */
  // const onTaskChange = (change: PouchDB.Core.ChangesResponseChange<Task>) => {
  //   if (change.deleted) {
  //     // If document was deleted, remove it from UI
  //     setTasks((state) => state.filter((t) => t._id !== change.id));
  //   } else {
  //     // Find and update relevant document
  //     const newDoc = change.doc as PouchDB.Core.ExistingDocument<
  //       Task & PouchDB.Core.ChangesMeta
  //     >;
  //     setTasks((state) => [
  //       // Remove matching document from array, if any, then add/re-add document
  //       ...(state.filter((t) => t._id !== change.id) || []),
  //       newDoc,
  //     ]);
  //   }
  // };

  /**
   * Load all documents and update state.
   *
   * Does not fetch deleted docs
   */
  const loadDocs = () => {
    db.current
      ?.allDocs({ include_docs: true, descending: true })
      .then((docs) =>
        setTasks(
          docs.rows.map((x) => x.doc as PouchDB.Core.ExistingDocument<Task>)
        )
      );
  };

  // TODO This is probably inefficient?
  /**
   * (unused) Fetch deleted documents
   */
  // const fetchDeleted = () => {
  //   db.current
  //     ?.changes({
  //       live: true,
  //       since: 0,
  //       filter: (doc) => doc._deleted, // Only show deleted documents
  //     })
  //     .on("change", (change) => {
  //       db.current
  //         ?.get(change.id, { open_revs: "all", revs: true })
  //         .then((doc) => ({
  //           // TODO use bulkGet?
  //           _id: doc[0].ok._id,
  //           _rev: `${doc[0].ok._revisions.start - 1}-${
  //             doc[0].ok._revisions.ids[1]
  //           }`,
  //         }))
  //         .then(({ _id, _rev }) =>
  //           db.current?.get(_id, { rev: _rev }).then((doc) => console.log(doc))
  //         )
  //         .catch((err) => console.error(err));
  //     });
  // };

  useEffect(() => {
    const remoteDB = new PouchDB<Task>(
      "https://couchdb.nicholaslyz.com/lists",
      {
        auth: { username: "admin", password: "password" },
      }
    );

    let sync: PouchDB.Replication.Sync<Task> | undefined;

    if (indexedDbSupported) {
      // IndexedDB is supported
      db.current = new PouchDB<Task>("local");

      // Start replication. Change event handling is done on the localDB.
      sync = db.current.sync(remoteDB, { live: true, retry: true });
    } else {
      // No IndexedDB, use direct connection instead
      console.warn(
        "IndexedDB not supported in this browser (is this a Firefox private tab?)"
      );
      console.warn(
        "Connecting to remote database directly (no offline support)"
      );
      db.current = remoteDB;
    }

    const changes = db.current
      .changes({ live: true, since: "now", include_docs: true })
      .on("change", loadDocs);

    loadDocs();
    setLoading(false);

    return () => {
      sync?.cancel();
      changes?.cancel();
      remoteDB.close();
    };
  }, [indexedDbSupported]);

  return loading ? (
    <Text>{loadingMsg}</Text>
  ) : (
    <>
      <Container>
        <Text fz={"xl"} ta={"center"}>
          Tasks
        </Text>
        <Table highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Flex>
                  <TextInput style={{ flexGrow: 1 }} ref={addTaskRef} />
                  <Button
                    onClick={() => {
                      createTask(addTaskRef.current?.value || "");
                      addTaskRef.current && (addTaskRef.current.value = "");
                    }}
                  >
                    Add Task
                  </Button>
                </Flex>
              </td>
            </tr>
            {tasks.map((t) => (
              <tr key={t._id}>
                <td>
                  <Tooltip
                    label={
                      <Stack spacing={0}>
                        <Text>
                          _id: <Code>{t._id}</Code>
                        </Text>
                        <Text>
                          _rev: <Code>{t._rev}</Code>
                        </Text>
                        {t.modified && (
                          <>
                            <Text>
                              Edited{" "}
                              <ReactTimeAgo date={Date.parse(t.modified)} />
                            </Text>
                          </>
                        )}
                      </Stack>
                    }
                    transitionProps={{ transition: "pop" }}
                    openDelay={500}
                    position="bottom-end"
                  >
                    <Flex align={"center"}>
                      <ActionIcon onClick={() => completeTaskToggle(t)}>
                        {t.completed ? (
                          <IconSquareCheck size={20} />
                        ) : (
                          <IconSquare size={20} />
                        )}
                      </ActionIcon>
                      <ActionIcon onClick={() => deleteTask(t._id, t._rev)}>
                        <IconTrash size={20} />
                      </ActionIcon>
                      <TaskDisplay task={t} updateTask={updateTask} />
                    </Flex>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/extrange/realtime-todo-list"
          variant="outline"
          leftIcon={<IconExternalLink size={"1.2rem"} />}
        >
          Github
        </Button>
      </Container>
    </>
  );
};
