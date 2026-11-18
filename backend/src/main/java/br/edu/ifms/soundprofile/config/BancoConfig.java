package br.edu.ifms.soundprofile.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/** Conexão com o PostgreSQL (Neon). As credenciais vêm só da variável de ambiente DATABASE_URL. */
@Configuration
public class BancoConfig {

    @Bean
    public DataSource dataSource(Environment ambiente) {
        String url = ambiente.getProperty("DATABASE_URL");
        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                "Defina a variável de ambiente DATABASE_URL (postgresql://usuario:senha@servidor:5432/banco).");
        }
        ConexaoBanco conexao = ConexaoBanco.deUrl(url);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(conexao.jdbcUrl());
        config.setUsername(conexao.usuario());
        config.setPassword(conexao.senha());
        config.setPoolName("soundprofile");
        config.setMaximumPoolSize(5);          // o plano gratuito do Neon tem poucas conexões
        config.setMinimumIdle(0);
        config.setMaxLifetime(300_000);        // renova conexões a cada 5 min (o Neon suspende o banco ocioso)
        config.setConnectionTimeout(15_000);
        return new HikariDataSource(config);
    }
}
