package com.movieflix.model;

import java.sql.Timestamp;

/** Represents a registered user */
public class User {
    private int       id;
    private String    name;
    private String    email;
    private String    password;
    private String    phone;
    private Timestamp createdAt;

    public User() {}

    public User(int id, String name, String email, String phone, Timestamp createdAt) {
        this.id        = id;
        this.name      = name;
        this.email     = email;
        this.phone     = phone;
        this.createdAt = createdAt;
    }

    // ── Getters & Setters ──────────────────────────────────────────────
    public int       getId()        { return id;        }
    public void      setId(int id)  { this.id = id;     }

    public String    getName()             { return name;          }
    public void      setName(String name)  { this.name = name;     }

    public String    getEmail()              { return email;         }
    public void      setEmail(String email)  { this.email = email;   }

    public String    getPassword()                   { return password;          }
    public void      setPassword(String password)    { this.password = password; }

    public String    getPhone()              { return phone;         }
    public void      setPhone(String phone)  { this.phone = phone;   }

    public Timestamp getCreatedAt()                    { return createdAt;           }
    public void      setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
