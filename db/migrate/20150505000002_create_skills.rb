class CreateSkills < ActiveRecord::Migration
  def change
    create_table :skills do |t|
      t.references :node, index: true
      t.references :user, index: true
      t.integer :level

      t.timestamps null: false
    end
    add_foreign_key :skills, :nodes
    add_foreign_key :skills, :users
  end
end
