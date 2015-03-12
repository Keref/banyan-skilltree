json.array!(@nodes) do |node|
  json.extract! node, :id, :name, :content, :user_id, :nodetype
  json.url node_url(node, format: :json)
end
