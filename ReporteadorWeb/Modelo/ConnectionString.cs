using System;
using System.Configuration;

namespace ReporteadorWeb.Modelo
{
    internal class ConnectionString
    {
        public static string GetConnectionString(string name)
        {
            var connStr = ConfigurationManager.ConnectionStrings[name];

            if (connStr != null)
                return connStr.ConnectionString;

            throw new Exception("No se encontro la conexion");
        }
    }
}
