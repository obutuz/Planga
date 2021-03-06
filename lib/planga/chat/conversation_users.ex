defmodule Planga.Chat.ConversationUser do
  use Ecto.Schema
  import Ecto.Changeset


  schema "conversations_users" do
    field :conversation_id, :integer
    field :user_id, :integer

    timestamps()
  end

  @doc false
  def changeset(conversation_user, attrs) do
    conversation_user
    |> cast(attrs, [:conversation_id, :user_id])
    |> validate_required([:conversation_id, :user_id])
  end
end
