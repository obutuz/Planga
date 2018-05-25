defmodule PlangeWeb.ChatChannel do
  use PlangeWeb, :channel

  def join("chat:" <> channel_id, payload, socket) do
    IO.puts("Channel id: #{channel_id}")
    with user <- attempt_authorization(payload) do
      socket =
        socket
        |> assign(:user_id, user.id)
        |> assign(:channel_id, channel_id)
        |> IO.inspect

      send(self, :after_join)
      {:ok, socket}
    else
      _ ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    send_previous_messages(socket)
    {:noreply, socket}
  end


  def send_previous_messages(socket) do
     # conversation = Plange.Chat.get_conversation_by_remote_id!(socket.assigns.channel_id)
     messages = Plange.Chat.get_messages_by_conversation_id(socket.assigns.channel_id)
     json_hash =
       messages
       |> Enum.map(&message_dict/1)
       |> IO.inspect(tag: "messages")
     push socket, "messages_so_far", %{messages: json_hash}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (chat:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("new_message", payload, socket) do
    # TODO: Checking if user is allowed to be part of conversation.
    conversation = Plange.Chat.get_conversation_by_remote_id!(socket.assigns.channel_id)
    user_id = socket.assigns.user_id
    # user = Plange.Chat.get_user_by_name("TODO", payload["name"])
    IO.inspect("Creating message in #{inspect conversation} sent by #{inspect user_id}")

    message = Plange.Chat.create_good_message(conversation.id, user_id, payload["message"])

    # |> Plange.Chat.create_message(conversation_id, payload)

    broadcast! socket, "new_message", message_dict(message)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp attempt_authorization(payload) do
    IO.inspect({:payload, payload})
    # Check if app exists
    # app = Plange.Chat.get_app!(payload["app_id"])
    # Check if user exists in app
    user = Plange.Chat.get_user_by_remote_id!(payload["app_id"], payload["remote_user_id"])
  end

  defp message_dict(message) do
    %{"name" => message.sender.name, "message" => message.content}
  end
end