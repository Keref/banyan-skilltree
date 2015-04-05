class AddUniquenessUsernodeSkills < ActiveRecord::Migration
  def change
         add_index :skills, [:node_id, :user_id], unique: true
  end
end
