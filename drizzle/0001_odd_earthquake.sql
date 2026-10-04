CREATE TABLE `colony_contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`member` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `colony_contributions_member` ON `colony_contributions` (`member`);--> statement-breakpoint
CREATE TABLE `colony_points` (
	`id` text PRIMARY KEY NOT NULL,
	`member` text NOT NULL,
	`task` text NOT NULL,
	`points` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `colony_points_member` ON `colony_points` (`member`);