import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Declaring a WebServlet called StarServlet, which maps to url "/api/star"
@WebServlet(name = "TopNewsServlet", urlPatterns = "/api/topnews")
public class TopNewsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("application/json"); // Response mime type
		response.setCharacterEncoding("UTF-8");
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		// Retrieve parameter limit from url request.
		String limit = request.getParameter("limit");

		// Output stream to STDOUT
		PrintWriter out = response.getWriter();

		try {
			Context initCtx = new InitialContext();

            Context envCtx = (Context) initCtx.lookup("java:comp/env");
            if (envCtx == null)
                throw new Exception("context is null");

            // Look up our data source
			DataSource dataSource = (DataSource) envCtx.lookup("jdbc/masterdb");
			
			// Get a connection from dataSource
			Connection dbcon = dataSource.getConnection();

			// Construct a query with parameter represented by "?"
			String query = "select p.id, title, author, content, p.update_time, c.name as c_name, i.thumb_url, i.url as photo_url from posts as p, categories as c, images as i where p.status = 1 and p.image_header_id = i.id and p.category_id = c.id order by p.likes DESC limit ?";

			// Declare our statement
			PreparedStatement statement = dbcon.prepareStatement(query);

			// Set the parameter represented by "?" in the query to the id we get from url,
			// num 1 indicates the first "?" in the query
			statement.setInt(1, Integer.parseInt(limit));

			// Perform the query
			ResultSet rs = statement.executeQuery();

			JsonArray jsonArray = new JsonArray();

			// Iterate through each row of rs
			while (rs.next()) {
				String id = rs.getString("id");
				String title = rs.getString("title");
				String author = rs.getString("author");
				String update_time = rs.getString("update_time");
                String content = rs.getString("content");
				String c_name = rs.getString("c_name");
				String thumb_url = rs.getString("thumb_url");
				String photo_url = rs.getString("photo_url");

				// Create a JsonObject based on the data we retrieve from rs

				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("id", id);
                jsonObject.addProperty("title", title);
                jsonObject.addProperty("content", content);
				jsonObject.addProperty("author", author);
				jsonObject.addProperty("c_name", c_name);
				jsonObject.addProperty("thumb_url", thumb_url);
				jsonObject.addProperty("update_time", update_time);
				jsonObject.addProperty("photo_url", photo_url);

				jsonArray.add(jsonObject);
			}
			
            // write JSON string to output
            out.write(jsonArray.toString());
            // set response status to 200 (OK)
            response.setStatus(200);

			rs.close();
			statement.close();
			dbcon.close();
		} catch (Exception e) {
			// write error message JSON object to output
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("errorMessage", e.getMessage());
			out.write(jsonObject.toString());

			// set reponse status to 500 (Internal Server Error)
			response.setStatus(500);
		}
		out.close();

	}

}
