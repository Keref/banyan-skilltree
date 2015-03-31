# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150331085747) do

  create_table "nodelinks", force: :cascade do |t|
    t.string   "Node"
    t.text     "name"
    t.text     "content"
    t.text     "linktype"
    t.integer  "node_id"
    t.integer  "targetnode_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  add_index "nodelinks", ["node_id"], name: "index_nodelinks_on_node_id"
  add_index "nodelinks", ["targetnode_id"], name: "index_nodelinks_on_targetnode_id"

  create_table "nodes", force: :cascade do |t|
    t.text     "name"
    t.text     "content"
    t.integer  "user_id"
    t.text     "nodetype"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "offsetTop"
    t.integer  "offsetLeft"
    t.string   "icon"
  end

  add_index "nodes", ["user_id"], name: "index_nodes_on_user_id"

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.string   "password_digest"
    t.string   "remember_digest"
    t.boolean  "admin"
    t.string   "activation_digest"
    t.boolean  "activated"
    t.datetime "activated_at"
    t.string   "reset_digest"
    t.datetime "reset_sent_at"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true

end
