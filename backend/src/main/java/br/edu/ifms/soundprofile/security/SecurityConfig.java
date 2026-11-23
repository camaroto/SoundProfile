package br.edu.ifms.soundprofile.security;

import org.springframework.beans.factory.annotation.Qualifier;
import br.edu.ifms.soundprofile.config.PropriedadesApp;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String JSON_NAO_AUTENTICADO = "{\"codigo\":null,\"mensagem\":\"Faça login para continuar.\",\"campos\":{}}";
    private static final String JSON_PROIBIDO = "{\"codigo\":null,\"mensagem\":\"Você não tem permissão para isso.\",\"campos\":{}}";

    /**
     * API sem estado: a identidade vem do token no cabeçalho Authorization, nunca
     * de cookie.
     * Como não há cookie de sessão, não existe ataque CSRF a proteger, então o CSRF
     * fica desligado.
     */
    @Bean
    public SecurityFilterChain filtros(
            HttpSecurity http,
            JdbcClient jdbc,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource cors) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(cors))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(
                                "/api/auth/cadastro",
                                "/api/auth/login",
                                "/api/auth/verificar-email",
                                "/api/auth/reenviar-codigo",
                                "/api/auth/google",
                                "/api/auth/google/username-disponivel",
                                "/api/auth/google/finalizar",
                                "/api/saude")
                        .permitAll()
                        // Leitura pública (perfis e imagens); escrita sempre exige login.
                        .requestMatchers(HttpMethod.GET,
                                "/api/perfis/**",
                                "/api/imagens/**",
                                "/api/spotify/**",
                                "/api/preview")
                        .permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(new SessaoFilter(jdbc), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> escrever(res, 401, JSON_NAO_AUTENTICADO))
                        .accessDeniedHandler((req, res, ex) -> escrever(res, 403, JSON_PROIBIDO)));
        return http.build();
    }

    private static void escrever(jakarta.servlet.http.HttpServletResponse res, int status, String json)
            throws java.io.IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(json);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(PropriedadesApp props) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(props.corsOrigens());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/api/**", cors);
        return fonte;
    }

    /**
     * BCrypt é compatível com os hashes já gravados pelo site (bcryptjs, prefixo
     * $2b$).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
