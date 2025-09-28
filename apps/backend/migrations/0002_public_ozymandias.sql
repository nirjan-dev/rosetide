ALTER TABLE `periods` RENAME TO `period`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_period` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_period`("id", "user_id", "start_date", "end_date", "created_at", "updated_at") SELECT "id", "user_id", "start_date", "end_date", "created_at", "updated_at" FROM `period`;--> statement-breakpoint
DROP TABLE `period`;--> statement-breakpoint
ALTER TABLE `__new_period` RENAME TO `period`;--> statement-breakpoint
PRAGMA foreign_keys=ON;