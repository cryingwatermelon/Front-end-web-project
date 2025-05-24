CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()) ON UPDATE (unixepoch())
);

-- CREATE TRIGGER update_[tasks]_updatedAt
-- AFTER UPDATE ON [tasks]
-- FOR EACH ROW
-- BEGIN
--     UPDATE [tasks]
--     SET updated_at = unixepoch()
--     WHERE id = OLD.id;
-- END;