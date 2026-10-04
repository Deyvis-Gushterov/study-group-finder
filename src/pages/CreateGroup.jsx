import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createGroup } from "../services/groupService";
import GroupForm from "../components/GroupForm";

const emptyGroup = { title: "", subject: "", description: "", location: "", schedule: "" };

function CreateGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (values) => {
    const id = await createGroup(values, user);
    navigate(`/groups/${id}`);
  };

  return (
    <GroupForm
      title="Create study group"
      initialValues={emptyGroup}
      onSubmit={handleCreate}
      submitLabel="Create group"
      submittingLabel="Creating..."
    />
  );
}

export default CreateGroup;