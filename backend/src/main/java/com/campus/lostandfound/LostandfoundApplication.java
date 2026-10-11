package com.campus.lostandfound;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class LostandfoundApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(LostandfoundApplication.class, args);
	}

	private static void loadDotenv() {
		try {
			Dotenv dotenv;
			if (new File(".env").exists()) {
				dotenv = Dotenv.configure().load();
			} else if (new File("backend/.env").exists()) {
				dotenv = Dotenv.configure().directory("backend").load();
			} else if (new File("../.env").exists()) {
				dotenv = Dotenv.configure().directory("..").load();
			} else {
				dotenv = Dotenv.configure().ignoreIfMissing().load();
			}

			dotenv.entries().forEach(entry -> {
				if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
					System.setProperty(entry.getKey(), entry.getValue());
				}
			});
		} catch (Exception ignored) {
		}
	}

}
