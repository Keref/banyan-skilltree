json.array!(@skills) do |skill|
  json.extract! skill, :id, :node_id, :user_id, :level
  json.url skill_url(skill, format: :json)
end
