CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_created` ON `events` (`created`);--> statement-breakpoint
CREATE TABLE `market` (
	`mint` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`ant` integer NOT NULL,
	`amount` integer NOT NULL,
	`input_mint` text NOT NULL,
	`output_mint` text NOT NULL,
	`wallet` text NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`quote` text,
	`result` text,
	`signature` text
);
--> statement-breakpoint
CREATE INDEX `missions_created` ON `missions` (`created`);--> statement-breakpoint
CREATE INDEX `missions_mode_status` ON `missions` (`mode`,`status`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated` integer NOT NULL
);
