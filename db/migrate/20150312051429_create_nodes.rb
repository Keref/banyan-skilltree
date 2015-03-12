class CreateNodes < ActiveRecord::Migration
  def change
    create_table :nodes do |t|
      t.text :name
      t.text :content
      t.references :user, index: true
      t.text :nodetype

      t.timestamps null: false
    end
    add_foreign_key :nodes, :users
  end
end
